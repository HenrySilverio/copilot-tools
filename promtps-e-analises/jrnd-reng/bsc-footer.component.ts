import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';

export type BscFooterVariant =
  | 'fluxo'
  | 'fluxo-2'
  | 'fluxo-2-sem-primario'
  | 'so-voltar'
  | 'subhome';

@Component({
  selector: 'bsc-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './bsc-footer.component.html',
  styleUrl: './bsc-footer.component.scss',
})
export class BscFooterComponent {
  readonly variant = input<BscFooterVariant>('fluxo');
  readonly primaryLabel = input('Continuar');
  readonly secondaryLabel = input('Voltar');
  readonly tertiaryLabel = input('Voltar ao início');
  readonly quantityText = input('');
  readonly valueText = input('');
  readonly primaryDisabled = input(false);
  readonly secondaryDisabled = input(false);
  readonly tertiaryDisabled = input(false);

  readonly primaryClick = output<void>();
  readonly secondaryClick = output<void>();
  readonly tertiaryClick = output<void>();
}