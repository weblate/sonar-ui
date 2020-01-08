/*
 * SONAR UI
 * Copyright (C) 2019 RERO
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
import {
  Component,
  OnInit,
  ChangeDetectorRef,
  AfterContentChecked,
  OnDestroy
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormArray, Validators, AbstractControl } from '@angular/forms';
import { of, Observable, from, forkJoin } from 'rxjs';
import {
  map,
  switchMap,
  delay,
  concatMap,
  tap,
  mergeMap,
  reduce,
  takeWhile,
  first
} from 'rxjs/operators';

import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { DialogService } from '@rero/ng-core';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { TranslateService } from '@ngx-translate/core';

import { DepositService } from '../deposit.service';

@Component({
  selector: 'sonar-deposit-upload',
  templateUrl: './upload.component.html'
})
export class UploadComponent implements OnInit, AfterContentChecked, OnDestroy {
  /**
   * Files list, an item can be a file to upload or an uploaded file.
   */
  files: Array<any> = [];

  /**
   * Deposit object
   */
  deposit: any = null;

  /** Form for handling files metdata */
  filesForm: FormArray = null;

  /** Flag activated when component is destroyed. Is used to unsubscribe to observables with takeWhile operator. */
  destroyed = false;

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
    if (this.deposit) {
      return this.deposit.step;
    }
    return 'create';
  }

  constructor(
    private toastr: ToastrService,
    private depositService: DepositService,
    private router: Router,
    private route: ActivatedRoute,
    private dialogService: DialogService,
    private spinner: NgxSpinnerService,
    private translateService: TranslateService,
    private fb: FormBuilder,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.spinner.show();

    this.route.params
      .pipe(
        first(),
        tap(() => {
          this.spinner.show();
        }),
        switchMap(params => {
          if (params.id !== '0') {
            return forkJoin(
              this.depositService.get(params.id),
              this.depositService.getFiles(params.id)
            ).pipe(
              tap(result => {
                this.deposit = result[0].metadata;

                if (this.depositService.canAccessDeposit(this.deposit) === false) {
                  this.router.navigate(['deposit', this.deposit.pid, 'confirmation']);
                }

                this.files = result[1];
              })
            );
          } else {
            this.deposit = null;
            this.files = [];
            return of(null);
          }
        })
      )
      .subscribe(() => {
        this.spinner.hide();
        this.initForm();
      });
  }

  ngAfterContentChecked() {
    this.cd.detectChanges();
  }

  ngOnDestroy() {
    this.destroyed = true;
  }

  /**
   * Get list of file for the given type.
   * @param type - string, type of files
   */
  getFilesByType(type: string): Array<any> {
    return this.files.filter((item: any) => item.category === type);
  }

  /**
   * Upload a file to the server and create a deposit if it's not already
   * created.
   * @param files Array of files to upload
   * @param type Type of file
   */
  uploadFiles(files: Array<any>, type: string) {
    this.spinner.show();

    // Create a deposit if not existing
    let createDeposit$: Observable<any> = this.depositService.create().pipe(
      tap(deposit => (this.deposit = deposit.metadata)),
      delay(1000),
      map(() => {
        if (type === 'main') {
          this.router.navigate(['deposit', this.deposit.pid, 'create']);
        }
      })
    );

    if (this.deposit) {
      createDeposit$ = of(this.deposit);
    }

    createDeposit$
      .pipe(
        switchMap(() => {
          return from(files).pipe(
            concatMap((file: File) => {
              return this.depositService.uploadFile(this.deposit.pid, file.name, type, file);
            })
          );
        })
      )
      .subscribe({
        next: (file: any) => {
          this.toastr.success(_('File uploaded successfully') + ': ' + file.key);
          this.files.push(file);
          this.addFormField(file);
        },
        complete: () => {
          this.spinner.hide();
        },
        error: () => {
          this.spinner.hide();
          this.toastr.error(_('An error occurred during file upload process, please try again.'));
        }
      });
  }

  /**
   * Removes a deposit (after confirmation) and go back to upload homepage.
   */
  cancelDeposit() {
    this.depositService.deleteDepositWithConfirmation(this.deposit).subscribe((result: any) => {
      if (result === true) {
        this.files = [];
        this.deposit = null;
        this.router.navigate(['deposit', '0', 'create']);
      }
    });
  }

  /**
   * Method called when ngx-dropzone receive a file, add the selected file to
   * files list.
   * @param event - Event, contains the added files.
   * @param type Type of file to upload.
   * @param limit Limit files for the type.
   */
  onSelect(event: any, type: string, limit: number) {
    if (limit !== 0 && this.getFilesByType(type).length >= limit) {
      this.toastr.error(_('You cannot add more files, please remove existing files first.'));
      return;
    }

    event.addedFiles.forEach((file: any, index: number) => {
      if (this.getFilesByType(type).filter(item => item.key === file.name).length > 0) {
        this.toastr.error(
          _('File with the same name is already added to the deposit: ' + file.name)
        );
        event.addedFiles.splice(index, 1);
      }
    });

    if (event.addedFiles.length > 0) {
      this.uploadFiles(event.addedFiles, type);
    }
  }

  /**
   * Method called when a file is removed from dropzone. If file is already
   * uploaded, it has to be deleted from database with confirmation.
   *
   * @param Event DOM event triggered
   * @param file - File to remove
   */
  removeFile(event: Event, file: any) {
    event.preventDefault();

    this.dialogService
      .show({
        ignoreBackdropClick: true,
        initialState: {
          title: _('Confirmation'),
          body: _('Do you really want to remove this file ?'),
          confirmButton: true,
          confirmTitleButton: _('OK'),
          cancelTitleButton: _('Cancel')
        }
      })
      .pipe(
        switchMap((confirm: boolean) => {
          if (confirm === true) {
            return this.depositService
              .removeFile(this.deposit.pid, file.key, file.version_id)
              .pipe(map(() => true));
          }
          return of(false);
        })
      )
      .subscribe((removed: boolean) => {
        if (removed === true) {
          const index = this.files.indexOf(file);
          this.files.splice(this.files.indexOf(file), 1);
          this.toastr.success(
            this.translateService.instant(`File ${file.key} removed successfully.`)
          );
          this.filesForm.removeAt(index);
        }
      });
  }

  /**
   * Create a deposit without associated files.
   * @param event - Event
   */
  createEmptyDeposit(event: Event) {
    event.preventDefault();

    if (this.deposit) {
      this.router.navigate(['deposit', this.deposit.pid, 'metadata']);
      return;
    }

    this.depositService
      .create()
      .pipe(
        tap(() => this.spinner.show()),
        delay(1000)
      )
      .subscribe((deposit: any) => {
        this.spinner.hide();
        this.router.navigate(['deposit', deposit.id, 'metadata']);
      });
  }

  /**
   * Save files metadata and go to next step.
   * @param event Dom event
   */
  saveAndContinue(event: Event) {
    event.preventDefault();

    const filesToUpdate = [];

    if (this.filesForm.touched === true) {
      this.filesForm.value.forEach((value: any) => {
        const index = this.files.findIndex(item => item.version_id === value.id);

        if (this.filesForm.at(index).dirty) {
          // remove embargo date if embargo is not checked
          value.embargoDate = value.embargo === true ? value.embargoDate : '';

          this.files[index] = { ...this.files[index], ...value };
          filesToUpdate.push(this.files[index]);
        }
      });
    }

    if (filesToUpdate.length > 0) {
      from(filesToUpdate)
        .pipe(
          mergeMap((file: any) => {
            return this.depositService.updateFile(this.deposit.pid, file);
          }),
          reduce(() => true)
        )
        .subscribe(() => {
          this.toastr.success(
            this.translateService.instant('The files have been updated successfully.')
          );
          this.router.navigate(['deposit', this.deposit.pid, 'metadata']);
        });
    } else {
      this.router.navigate(['deposit', this.deposit.pid, 'metadata']);
    }
  }

  /**
   * Check if the field is invalid.
   * @param field Form field to check
   */
  isFieldInvalid(field: any) {
    return field.invalid && (field.dirty || field.touched);
  }

  /**
   * Create form for managing files
   */
  private initForm() {
    this.filesForm = this.fb.array([]);

    this.files.forEach(file => {
      this.addFormField(file);
    });
  }

  /**
   * Add a new entry in the form.
   * @param file File data
   */
  private addFormField(file: any) {
    const control = this.fb.group({
      label: [file.label, Validators.required],
      embargo: [file.embargo],
      embargoDate: [file.embargoDate, this.embargoDateValidator],
      expect: [file.expect],
      id: file.version_id
    });
    this.filesForm.push(control);
    control
      .get('embargo')
      .valueChanges.pipe(takeWhile(() => this.destroyed === false))
      .subscribe((values: any) => {
        if (values === false) {
          control.get('embargoDate').setValue('');
        }
        control.get('embargoDate').updateValueAndValidity();
      });
  }

  /**
   * Conditional validator for embargo date.
   * @param formControl Form control to add a validator
   */
  private embargoDateValidator(formControl: AbstractControl) {
    if (!formControl.parent) {
      return null;
    }

    if (formControl.parent.get('embargo').value) {
      return Validators.required(formControl);
    }
    return null;
  }
}
