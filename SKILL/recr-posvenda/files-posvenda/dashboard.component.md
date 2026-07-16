@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [BscTableComponent, PaginacaoComponent],
})
export class DashboardComponent implements OnInit {
  private store = inject(RenegociacaoStore);
  readonly tableId = 'dashboard-renegociacoes-table';
  readonly itensPorPagina = 10;
  readonly paginaAtual = signal(1);
  readonly listaFiltrada = computed(() => this.obterAcompanhamentos());
  readonly totalItens = computed(() => this.listaFiltrada().length);
  readonly deveExibirPaginacao = computed(() => this.totalItens() > this.itensPorPagina);
  readonly dadosTabela = computed(() => {
    const lista = this.listaFiltrada();

    return this.deveExibirPaginacao() ? this.paginar(lista) : lista;
  });

  readonly opcoesTabela: BscTableOptions = {
    layout: 'fitColumns',
    isStripedRows: true,
    responsiveLayout: 'hide',
    height: 'auto',
  };

  readonly colunasTabela: BscTableColumn[] = [
    {
      title: 'Contrato',
      field: 'contrato',
      maxWidth: '150',
      vertAlign: 'middle',
      resizable: false,
    },
    {
      title: 'Data de adesão',
      field: 'dataAdesao',
      vertAlign: 'middle',
      hozAlign: 'left',
    },
    {
      title: 'Cliente',
      field: 'cliente',
      minWidth: '45',
      vertAlign: 'middle',
      hozAlign: 'left',
      widthGrow: 1.5,
      formatter: (cell: any) => this.formatarCliente(cell.getValue()),
    },
    {
      title: 'Total renegociado',
      field: 'totalRenegociado',
      vertAlign: 'middle',
      minWidth: '45',
      resizable: false,
      formatter: 'moeda',
    },
    {
      title: 'Status',
      field: 'status',
      vertAlign: 'middle',
      formatter: (cell: any) => this.formatarStatus(cell.getValue()),
    },
    {
      title: '',
      field: 'acao',
      vertAlign: 'middle',
      hozAlign: 'center',
      width: '65',
      headerSort: false,
      formatter: () =>
        `<button class="brad-btn brad-btn-text">
          <em class="icon-ui-chevron-right brad-text-color-cta"></em>
        </button>`,
    },
  ];

  ngOnInit(): void {
    this.store.carregarAcompanhamentos();
  }

  private obterAcompanhamentos(): Acompanhamento[] {
    const acompanhamentos = this.store.acompanhamentos as unknown as Acompanhamento[] | (() => Acompanhamento[]);

    return typeof acompanhamentos === 'function' ? acompanhamentos() : acompanhamentos;
  }

  private formatarCliente(valor: string): string {
    return `<div style="white-space: normal; font-family: Bradesco, sans-serif; font-size: 14px;">${valor ?? ''}</div>`;
  }

  private normalizarTexto(valor: string): string {
    return valor
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  }

  private formatarStatus(valor: string): string {
    const status = this.normalizarTexto(valor ?? '');

    if (['em atraso', 'entrada pendente', 'cancelada'].includes(status)) {
      return `<em class="icon-feedback-view-on brad-m-sm-r"></em> ${valor}`;
    }

    if (status === 'proxima do vencimento') {
      return `<em class="icon-feedback-circle-warning brad-m-sm-r"></em> ${valor}`;
    }

    if (['em dia', 'liquidada'].includes(status)) {
      return `<em class="icon-feedback-check-box brad-m-sm-r"></em> ${valor}`;
    }

    return valor;
  }

  paginar(listaAcompanhamentos: Acompanhamento[]): Acompanhamento[] {
    const indiceInicial = (this.paginaAtual() - 1) * this.itensPorPagina;
    const indiceFinal = indiceInicial + this.itensPorPagina;
    return listaAcompanhamentos.slice(indiceInicial, indiceFinal);
  }
}