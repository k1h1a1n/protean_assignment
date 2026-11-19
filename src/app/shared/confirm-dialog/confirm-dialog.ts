import { Component, inject, Injectable } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';

/** What the confirmation dialog says. */
export interface ConfirmDialogData {
  title: string;
  message: string;
  /** Text on the confirm button. Default: "Confirm". */
  confirmLabel?: string;
  /** Text on the cancel button. Default: "Cancel". */
  cancelLabel?: string;
  /** 'danger' paints the confirm button red, for actions that throw something away. */
  tone?: 'default' | 'danger';
}

/** A dialog that asks "are you sure?". It closes with true (confirm) or false (cancel). */
@Component({
  imports: [MatDialogModule, MatButtonModule],
  selector: 'app-confirm-dialog',
  styleUrl: './confirm-dialog.scss',
  templateUrl: './confirm-dialog.html',
})
export class ConfirmDialog {
  protected readonly data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);
}

/** Opens the confirmation dialog: `if (await confirmation.ask({...})) doIt();` */
@Injectable({ providedIn: 'root' })
export class Confirmation {
  private readonly dialog = inject(MatDialog);

  /** Resolves true only when the user presses the confirm button (Esc or clicking outside: false). */
  async ask(data: ConfirmDialogData): Promise<boolean> {
    const ref = this.dialog.open<ConfirmDialog, ConfirmDialogData, boolean>(ConfirmDialog, {
      data,
      width: '24rem',
    });
    return (await firstValueFrom(ref.afterClosed())) === true;
  }
}
