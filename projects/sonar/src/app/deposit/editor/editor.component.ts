/*
 * SONAR User Interface
 * Copyright (C) 2020 RERO
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, version 3 of the License.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FormlyJsonschema } from '@ngx-formly/core/json-schema';
import { DialogService, TranslateLanguageService, TranslateService } from '@rero/ng-core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { combineLatest, EMPTY, of } from 'rxjs';
import { delay, first, switchMap, tap } from 'rxjs/operators';
import { UserService } from '../../user.service';
import { DepositService } from '../deposit.service';

@Component({
  selector: 'sonar-deposit-editor',
  templateUrl: './editor.component.html'
})
export class EditorComponent implements OnInit {
  /** Deposit object */
  deposit: any = null;

  /** Deposit creation date */
  createdAt: Date;

  /** Deposit modification date */
  updatedAt: Date;

  /** Current form to show */
  currentStep = 'metadata';

  /** Deposit steps */
  steps: string[] = ['create', 'metadata', 'contributors', 'diffusion'];

  /** Form for current type */
  form: FormGroup = new FormGroup({});

  /** Model representing data for current type */
  model: any;

  /** Form fields for current type */
  fields: any;

  /** Current view mode */
  view = 'form';

  /** File key to preview */
  previewFileKey: string;

  /** Store files associated with deposit */
  private _files: Array<any> = [];

  /**
   * Constructor.
   *
   * @param _toastr Toastr service.
   * @param _depositService Deposit service
   * @param _router Router service
   * @param _route Route
   * @param _formlyJsonschema Formly JSON schema.
   * @param _translateService Translate service.
   * @param _dialogService Dialog service.
   * @param _userUservice User service.
   * @param _spinner Spinner service.
   * @param _translateLanguageService Translate language service.
   */
  constructor(
    private _toastrService: ToastrService,
    private _depositService: DepositService,
    private _router: Router,
    private _route: ActivatedRoute,
    private _formlyJsonschema: FormlyJsonschema,
    private _translateService: TranslateService,
    private _dialogService: DialogService,
    private _userUservice: UserService,
    private _spinner: NgxSpinnerService,
    private _translateLanguageService: TranslateLanguageService
  ) { }

  ngOnInit(): void {
    this._route.params
      .pipe(
        tap(params => {
          this.currentStep = params.step;
        }),
        switchMap(params => {
          return combineLatest(
            this._depositService.getJsonSchema('deposits'),
            this._depositService.get(params.id),
            this._depositService.getFiles(params.id)
          );
        })
      )
      .subscribe(
        result => {
          this.deposit = result[1].metadata;

          if (this._depositService.canAccessDeposit(this.deposit) === false) {
            this._router.navigate(['deposit', this.deposit.pid, 'confirmation']);
          }

          this.createdAt = result[1].created;
          this.updatedAt = result[1].updated;
          this.createForm(result[0]);

          this._files = result[2];
        },
        () => {
          this._toastrService.error(this._translateService.translate('Deposit not found'));
          this._router.navigate(['deposit', '0', 'create']);
        }
      );
  }

  /**
   * Return link prefix
   */
  get linkPrefix() {
    return `/deposit/${this.deposit ? this.deposit.pid : '0'}/`;
  }

  /**
   * Get max step
   */
  get maxStep() {
    return this.deposit ? this.deposit.step : 'metadata';
  }

  /** Return main file */
  get mainFile(): any {
    return this._files.find((item: any) => item.category === 'main');
  }

  /** Return additional files list */
  get additionalFiles(): Array<any> {
    return this._files.filter((item: any) => item.category === 'additional');
  }

  /** Return if current logged user is an admin or a standard user */
  get isAdminUser(): boolean {
    return this._userUservice.hasRole(['superadmin', 'admin', 'moderator']);
  }

  /**
   * For displaying publication data in deposit summary
   */
  get publication() {
    const journal: Array<string> = [];

    if (this.deposit.metadata.publication.publishedIn) {
      journal.push(this.deposit.metadata.publication.publishedIn);
    }

    if (this.deposit.metadata.publication.volume) {
      journal.push(
        this._translateService.translate('vol.') + ' ' + this.deposit.metadata.publication.volume
      );
    }

    if (this.deposit.metadata.publication.number) {
      journal.push(
        this._translateService.translate('no.') + ' ' + this.deposit.metadata.publication.number
      );
    }

    if (this.deposit.metadata.publication.pages) {
      journal.push(this._translateService.translate('p.') + ' ' + this.deposit.metadata.publication.pages);
    }

    return journal.join(', ');
  }

  /**
   * Return next step key
   */
  get nextStep() {
    const currentIndex = this.steps.findIndex(element => element === this.currentStep);
    if (!this.steps[currentIndex + 1]) {
      return this.steps[currentIndex];
    }
    return this.steps[currentIndex + 1];
  }

  /**
   * Check if the preview container must be displayed.
   * @return true if the preview must be displayed.
   */
  get showPreview(): boolean {
    if (this.view === 'json') {
      return false;
    }

    if (this.currentStep !== 'diffusion' && this.view !== 'preview') {
      return false;
    }

    return true;
  }

  /**
   * Save current state on database with API call.
   */
  save() {
    if (this.form.valid === false) {
      this._toastrService.error(this._translateService.translate('The form contains errors'));
      return;
    }

    this._upgradeStep();
    this.deposit[this.currentStep] = this.model[this.currentStep];

    this._depositService.update(this.deposit.pid, this.deposit).subscribe((result: any) => {
      if (result) {
        this._toastrService.success(this._translateService.translate('Deposit saved'));

        if (this.currentStep !== this.steps[this.steps.length - 1]) {
          this._router.navigate(['deposit', this.deposit.pid, this.nextStep]);
        }
      }
    });
  }

  /**
   * Return if the form is ready to publish or not.
   */
  isFinished(): boolean {
    return (
      (this.deposit.status === 'in_progress' || this.deposit.status === 'ask_for_changes') &&
      this.currentStep === this.steps[this.steps.length - 1] &&
      this.deposit.step === this.steps[this.steps.length - 1]
    );
  }

  /**
   * Removes a deposit (after confirmation) and go back to upload homepage.
   */
  cancelDeposit() {
    this._depositService.deleteDepositWithConfirmation(this.deposit).subscribe((result: any) => {
      if (result === true) {
        this.deposit = null;
        this._router.navigate(['deposit', '0', 'create']);
      }
    });
  }

  /**
   * Publish a deposit after user confirmation. If user is a standard user, this will send an email
   * to moderators to validate the deposit.
   */
  publish() {
    this._dialogService
      .show({
        ignoreBackdropClick: true,
        initialState: {
          title: this._translateService.translate('Confirmation'),
          body: this._translateService.translate('Do you really want to publish this document ?'),
          confirmButton: true,
          confirmTitleButton: this._translateService.translate('OK'),
          cancelTitleButton: this._translateService.translate('Cancel')
        }
      })
      .pipe(
        first(),
        switchMap((confirm: boolean) => {
          if (confirm === true) {
            this._spinner.show();
            return this._depositService.publish(this.deposit.pid);
          }

          return EMPTY;
        }),
        delay(1000)
      )
      .subscribe(() => {
        this._spinner.hide();
        this._router.navigate(['deposit', this.deposit.pid, 'confirmation']);
      });
  }

  /**
   * Extract metadata from PDF and populate deposit.
   */
  extractPdfMetadata() {
    this._dialogService
      .show({
        ignoreBackdropClick: true,
        initialState: {
          title: this._translateService.translate('Confirmation'),
          body: this._translateService.translate(
            'Do you really want to extract metadata from PDF and overwrite current data ?'
          ),
          confirmButton: true,
          confirmTitleButton: this._translateService.translate('OK'),
          cancelTitleButton: this._translateService.translate('Cancel')
        }
      })
      .pipe(
        first(),
        switchMap((result: boolean) => {
          if (result === false) {
            return of(false);
          }

          this._spinner.show();

          return this._depositService.extractPDFMetadata(this.deposit);
        }),
        switchMap((result: any) => {
          if (result === false) {
            return of(false);
          }

          if (!this.deposit.metadata) {
            this.deposit.metadata = {};
          }

          const currentTitle =
            this.deposit.metadata.title ||
            this._translateService.translate('Deposit #ID', { id: this.deposit.pid });

          if (result.title) {
            this.deposit.metadata.title = result.title;
          } else {
            this.deposit.metadata.title = currentTitle;
          }

          if (result.languages) {
            this.deposit.metadata.language = result.languages[0];
          }

          if (result.publication) {
            this.deposit.metadata.publication = result.publication;
          }

          if (result.abstract) {
            this.deposit.metadata.abstracts = [{ language: result.languages[0] || 'eng', abstract: result.abstract }];
          }

          if (result.authors) {
            this.deposit.contributors = result.authors;
          }

          return this._depositService.getJsonSchema('deposits');
        })
      )
      .subscribe((result: any) => {
        this._spinner.hide();

        if (result !== false) {
          this.createForm(result);
          this._toastrService.success(this._translateService.translate('Data imported successfully'));
        }
      });
  }

  /**
   * Create form by extracting section corresponding to current step from JSON schema.
   * @param schema JSON schema
   */
  private createForm(schema: any) {
    const depositFields = this._formlyJsonschema.toFieldConfig(schema, {
      map: (fieldConfig: any, fieldSchema) => {
        if (fieldSchema.form && fieldSchema.form.options) {
          fieldConfig.templateOptions.options = fieldSchema.form.options;
        }

        if (fieldSchema.template) {
          fieldConfig.templateOptions = { ...fieldConfig.templateOptions, ...fieldSchema.template };

          // change field input to textarea
          if (fieldSchema.template.type === 'textarea') {
            fieldConfig.type = 'textarea';
          }
        }

        return fieldConfig;
      }
    });

    this.model = {};
    this.form = new FormGroup({});

    if (this.deposit[this.currentStep]) {
      this.model[this.currentStep] = this.deposit[this.currentStep];
    }
    this.fields = this._getFormFields(depositFields.fieldGroup, this.currentStep);
  }

  /**
   * Get only fields corresponding to current step.
   * @param fieldGroup Array of fields extracted from JSON schema
   * @param step Current step
   */
  private _getFormFields(fieldGroup: Array<any>, step: string): Array<any> {
    const fields = fieldGroup.filter(item => item.key === step);
    return [fields[0]];
  }

  /**
   * Upgrade step of the deposit only if current step is greater than deposit step.
   */
  private _upgradeStep() {
    const depositIndex = this.steps.findIndex(step => step === this.deposit.step);
    const nextIndex = this.steps.findIndex(step => step === this.nextStep);

    if (depositIndex < nextIndex) {
      this.deposit.step = this.nextStep;
    }
  }
}
