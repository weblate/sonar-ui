/*
 * SONAR User Interface
 * Copyright (C) 2021 RERO
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
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'sonar-deposit-step',
  templateUrl: './step.component.html',
  styleUrls: ['./step.component.scss']
})
export class StepComponent implements OnInit {
  /** Current step of the process */
  @Input()
  currentStep: string = null;

  /** Current max step, no link available for next steps. */
  @Input()
  maxStep: string = null;

  /** Array of step for deposit process */
  @Input()
  steps: string[] = [];

  /** Link prefix for building routes */
  @Input()
  linkPrefix = '';

  /** Event emitted when a deposit is deleted. */
  @Output()
  cancel: EventEmitter<any> = new EventEmitter();

  /** Event emitted when a step is clicked. */
  @Output()
  clicked: EventEmitter<any> = new EventEmitter();

  ngOnInit() {
    if (this.steps.length === 0) {
      throw new Error('No steps defined');
    }

    if (!this.currentStep) {
      this.currentStep = this.steps[0];
    }

    if (!this.maxStep) {
      this.maxStep = this.steps[0];
    }
  }

  /**
   * Return index corresponding to the step parameter.
   *
   * @return Max step index
   */
  get maxStepIndex(): number {
    return this.steps.findIndex(element => element === this.maxStep);
  }

  /**
   * Return index corresponding to the step parameter.
   *
   * @return Current step index
   */
  get currentStepIndex(): number {
    return this.steps.findIndex(element => element === this.currentStep);
  }

  /**
   * Trigger a cancel on parent.
   *
   * @param event DOM event click
   */
  doCancel(event: Event) {
    event.preventDefault();
    this.cancel.emit();
  }

  /**
   * Method triggered when a step is clicked.
   *
   * @param step Step clicked.
   */
  click(step: string) {
    this.clicked.emit(step);
  }
}
