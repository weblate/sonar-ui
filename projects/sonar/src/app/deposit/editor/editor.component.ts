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
import { TranslateService } from '@ngx-translate/core';
import { DialogService } from '@rero/ng-core';
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
  steps: string[] = ['create', 'metadata', 'contributors', 'projects', 'diffusion'];

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
   * @param _toastr Toast service
   * @param _depositService Deposit service.
   * @param _router Router service.
   * @param _route Route.
   * @param _formlyJsonschema Formly JSON schema.
   * @param _translateService Translate service.
   * @param _dialogService Dialog service.
   * @param _userUservice User service.
   * @param _spinner Spinner service.
   */
  constructor(
    private _toastr: ToastrService,
    private _depositService: DepositService,
    private _router: Router,
    private _route: ActivatedRoute,
    private _formlyJsonschema: FormlyJsonschema,
    private _translateService: TranslateService,
    private _dialogService: DialogService,
    private _userUservice: UserService,
    private _spinner: NgxSpinnerService
  ) {}

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
          this._createForm(result[0]);

          this._files = result[2];
        },
        () => {
          this._toastr.error(this._translateService.instant('Deposit not found'));
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
   * For displaying journal data in deposit summary
   */
  get journal() {
    const journal: Array<string> = [];
    if (this.deposit.metadata.journal.name) {
      journal.push(this.deposit.metadata.journal.name);
    }

    if (this.deposit.metadata.journal.volume) {
      journal.push(
        this._translateService.instant('vol.') + ' ' + this.deposit.metadata.journal.volume
      );
    }

    if (this.deposit.metadata.journal.number) {
      journal.push(
        this._translateService.instant('no.') + ' ' + this.deposit.metadata.journal.number
      );
    }

    if (this.deposit.metadata.journal.pages) {
      journal.push(this._translateService.instant('p.') + ' ' + this.deposit.metadata.journal.pages);
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
   * Save current state on database with API call.
   */
  save() {
    if (this.form.valid === false) {
      return;
    }

    this._upgradeStep();
    this.deposit[this.currentStep] = this.model[this.currentStep];

    this._depositService.update(this.deposit.pid, this.deposit).subscribe((result: any) => {
      if (result) {
        this._toastr.success(this._translateService.instant('Deposit saved'));

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
      (this.deposit.status === 'in progress' || this.deposit.status === 'ask for changes') &&
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
          title: this._translateService.instant('Confirmation'),
          body: this._translateService.instant('Do you really want to publish this document ?'),
          confirmButton: true,
          confirmTitleButton: this._translateService.instant('OK'),
          cancelTitleButton: this._translateService.instant('Cancel')
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
          title: this._translateService.instant('Confirmation'),
          body: this._translateService.instant(
            'Do you really want to extract metadata from PDF and overwrite current data ?'
          ),
          confirmButton: true,
          confirmTitleButton: this._translateService.instant('OK'),
          cancelTitleButton: this._translateService.instant('Cancel')
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
            this._translateService.instant('Deposit #ID', { id: this.deposit.pid });

          if (result.title) {
            this.deposit.metadata.title = result.title;
          } else {
            this.deposit.metadata.title = currentTitle;
          }

          if (result.languages) {
            this.deposit.metadata.languages = result.languages;
          }

          if (result.journal) {
            this.deposit.metadata.journal = result.journal;
          }

          if (result.abstract) {
            this.deposit.metadata.abstracts = [result.abstract];
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
          this._createForm(result);
          this._toastr.success(this._translateService.instant('Data imported successfully'));
        }
      });
  }

  /**
   * Create form by extracting section corresponding to current step from JSON schema.
   * @param schema JSON schema
   */
  private _createForm(schema: any) {
    const depositFields = this._formlyJsonschema.toFieldConfig(schema, {
      map: (fieldConfig, fieldSchema) => {
        if (fieldSchema.template) {
          fieldConfig.templateOptions = { ...fieldConfig.templateOptions, ...fieldSchema.template };

          // change field input to textarea
          if (fieldSchema.template.type === 'textarea') {
            fieldConfig.type = 'textarea';
          }
        }

        if (fieldConfig.type !== 'array' && fieldConfig.type !== 'object') {
          fieldConfig.wrappers = ['form-field-horizontal'];
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
