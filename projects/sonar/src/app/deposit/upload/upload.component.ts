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
import { AfterContentChecked, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { TranslateService } from '@ngx-translate/core';
import { DialogService } from '@rero/ng-core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { forkJoin, from, Observable, of } from 'rxjs';
import { concatMap, delay, first, map, mergeMap, reduce, switchMap, takeWhile, tap } from 'rxjs/operators';
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

  constructor(
    private _toastr: ToastrService,
    private _depositService: DepositService,
    private _router: Router,
    private _route: ActivatedRoute,
    private _dialogService: DialogService,
    private _spinner: NgxSpinnerService,
    private _translateService: TranslateService,
    private _fb: FormBuilder,
    private _cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this._spinner.show();

    this._route.params
      .pipe(
        first(),
        tap(() => {
          this._spinner.show();
        }),
        switchMap(params => {
          if (params.id !== '0') {
            return forkJoin(
              this._depositService.get(params.id),
              this._depositService.getFiles(params.id)
            ).pipe(
              tap(result => {
                this.deposit = result[0].metadata;

                if (this._depositService.canAccessDeposit(this.deposit) === false) {
                  this._router.navigate(['deposit', this.deposit.pid, 'confirmation']);
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
        this._spinner.hide();
        this._initForm();
      });
  }

  ngAfterContentChecked() {
    this._cd.detectChanges();
  }

  ngOnDestroy() {
    this.destroyed = true;
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
    if (this.deposit) {
      return this.deposit.step;
    }
    return 'create';
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
    this._spinner.show();

    // Create a deposit if not existing
    let createDeposit$: Observable<any> = this._depositService.create().pipe(
      tap(deposit => (this.deposit = deposit.metadata)),
      delay(1000),
      map(() => {
        if (type === 'main') {
          this._router.navigate(['deposit', this.deposit.pid, 'create']);
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
              return this._depositService.uploadFile(this.deposit.pid, file.name, type, file);
            })
          );
        })
      )
      .subscribe({
        next: (file: any) => {
          this._toastr.success(_('File uploaded successfully') + ': ' + file.key);
          this.files.push(file);
          this._addFormField(file);
        },
        complete: () => {
          this._spinner.hide();
        },
        error: () => {
          this._spinner.hide();
          this._toastr.error(_('An error occurred during file upload process, please try again.'));
        }
      });
  }

  /**
   * Removes a deposit (after confirmation) and go back to upload homepage.
   */
  cancelDeposit() {
    this._depositService.deleteDepositWithConfirmation(this.deposit).subscribe((result: any) => {
      if (result === true) {
        this.files = [];
        this.deposit = null;
        this._router.navigate(['deposit', '0', 'create']);
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
      this._toastr.error(_('You cannot add more files, please remove existing files first.'));
      return;
    }

    event.addedFiles.forEach((file: any, index: number) => {
      if (this.getFilesByType(type).filter(item => item.key === file.name).length > 0) {
        this._toastr.error(
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

    this._dialogService
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
            return this._depositService
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
          this._toastr.success(
            this._translateService.instant(`File ${file.key} removed successfully.`)
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
      this._router.navigate(['deposit', this.deposit.pid, 'metadata']);
      return;
    }

    this._depositService
      .create()
      .pipe(
        tap(() => this._spinner.show()),
        delay(1000)
      )
      .subscribe((deposit: any) => {
        this._spinner.hide();
        this._router.navigate(['deposit', deposit.id, 'metadata']);
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
            return this._depositService.updateFile(this.deposit.pid, file);
          }),
          reduce(() => true)
        )
        .subscribe(() => {
          this._toastr.success(
            this._translateService.instant('The files have been updated successfully.')
          );
          this._router.navigate(['deposit', this.deposit.pid, 'metadata']);
        });
    } else {
      this._router.navigate(['deposit', this.deposit.pid, 'metadata']);
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
  private _initForm() {
    this.filesForm = this._fb.array([]);

    this.files.forEach(file => {
      this._addFormField(file);
    });
  }

  /**
   * Add a new entry in the form.
   * @param file File data
   */
  private _addFormField(file: any) {
    const control = this._fb.group({
      label: [file.label, Validators.required],
      embargo: [file.embargo],
      embargoDate: [file.embargoDate, this._embargoDateValidator],
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
  private _embargoDateValidator(formControl: AbstractControl) {
    if (!formControl.parent) {
      return null;
    }

    if (formControl.parent.get('embargo').value) {
      return Validators.required(formControl);
    }
    return null;
  }
}
