```bash
$ npm run build

> recr-fed-agc-posvenda@0.0.1 build
> ng build --configuration production --base-href .

 INFO  Building federation artefacts
One or more browsers which are configured in the project's Browserslist configuration fall outside Angular's browser support for this version.
Unsupported browsers:
ios_saf 16.3, ios_saf 16.2, ios_saf 16.1, ios_saf 16.0
X [ERROR] Could not resolve "@app/shared/components/bsc-table/bsc-table.component"

    src/app/feature/dashboard/pages/dashboard/dashboard.component.ts:3:67:
      3 │ import { BscTableComponent, BscTableColumn, BscTableOptions } from '@app/shared/components/bsc-table/bsc-table.component';
        ╵                                                                    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  You can mark the path "@app/shared/components/bsc-table/bsc-table.component" as external to
  exclude it from the bundle, which will remove this error and leave the unresolved path in the
  bundle.

X [ERROR] Could not resolve "@app/domain/ui/card-dados-cliente/card-dados-cliente.component"

    src/app/feature/acompanhamento/pages/detalhes-contrato/detalhes-contrato.component.ts:3:42:
      3 │ import { CardDadosClienteComponent } from '@app/domain/ui/card-dados-cliente/card-dados-cliente.component';
        ╵                                           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  You can mark the path "@app/domain/ui/card-dados-cliente/card-dados-cliente.component" as external
  to exclude it from the bundle, which will remove this error and leave the unresolved path in the
  bundle.

X [ERROR] Could not resolve "@app/core/services/router.service"

    src/app/feature/acompanhamento/pages/assinatura-documentos/assinatura-documentos.component.ts:3:30:
      3 │ import { RouterService } from '@app/core/services/router.service';
        ╵                               ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  You can mark the path "@app/core/services/router.service" as external to exclude it from the
  bundle, which will remove this error and leave the unresolved path in the bundle.

X [ERROR] Could not resolve "@app/core/services/router.service"

    src/app/feature/acompanhamento/pages/pagamento-da-entrada/pagamento-da-entrada.component.ts:3:30:
      3 │ import { RouterService } from '@app/core/services/router.service';
        ╵                               ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  You can mark the path "@app/core/services/router.service" as external to exclude it from the
  bundle, which will remove this error and leave the unresolved path in the bundle.

X [ERROR] Could not resolve "@app/shared/components/paginacao/paginacao.component"

    src/app/feature/dashboard/pages/dashboard/dashboard.component.ts:4:35:
      4 │ import { PaginacaoComponent } from '@app/shared/components/paginacao/paginacao.component';
        ╵                                    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  You can mark the path "@app/shared/components/paginacao/paginacao.component" as external to
  exclude it from the bundle, which will remove this error and leave the unresolved path in the
  bundle.

X [ERROR] Could not resolve "@app/domain/ui/card-valores-da-renegociacao/card-valores-da-renegociacao.component"

    src/app/feature/acompanhamento/pages/detalhes-contrato/detalhes-contrato.component.ts:4:51:
      4 │ import { CardValoresDaRenegociacaoComponent } from '@app/domain/ui/card-valores-da-renegociacao/card-valores-da-renegociacao.component';
        ╵                                                    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  You can mark the path
  "@app/domain/ui/card-valores-da-renegociacao/card-valores-da-renegociacao.component" as external
  to exclude it from the bundle, which will remove this error and leave the unresolved path in the
  bundle.

X [ERROR] Could not resolve "@app/domain/store/renegociacao.store"

    src/app/feature/acompanhamento/pages/assinatura-documentos/assinatura-documentos.component.ts:5:34:
      5 │ import { RenegociacaoStore } from '@app/domain/store/renegociacao.store';
        ╵                                   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  You can mark the path "@app/domain/store/renegociacao.store" as external to exclude it from the
  bundle, which will remove this error and leave the unresolved path in the bundle.

X [ERROR] Could not resolve "@app/shared/components/bsc-card/bsc-card.component"

    src/app/feature/acompanhamento/pages/pagamento-da-entrada/pagamento-da-entrada.component.ts:6:33:
      6 │ import { BscCardComponent } from '@app/shared/components/bsc-card/bsc-card.component';
        ╵                                  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  You can mark the path "@app/shared/components/bsc-card/bsc-card.component" as external to exclude
  it from the bundle, which will remove this error and leave the unresolved path in the bundle.

X [ERROR] Could not resolve "@app/domain/store/renegociacao.store"

    src/app/feature/dashboard/pages/dashboard/dashboard.component.ts:6:34:
      6 │ import { RenegociacaoStore } from '@app/domain/store/renegociacao.store';
        ╵                                   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  You can mark the path "@app/domain/store/renegociacao.store" as external to exclude it from the
  bundle, which will remove this error and leave the unresolved path in the bundle.

X [ERROR] Could not resolve "@app/domain/ui/card-status-renegociacao/card-status-renegociacao.component"

    src/app/feature/acompanhamento/pages/detalhes-contrato/detalhes-contrato.component.ts:5:48:
      5 │ import { CardStatusRenegociacaoComponent } from '@app/domain/ui/card-status-renegociacao/card-status-renegociacao.component';
        ╵                                                 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  You can mark the path "@app/domain/ui/card-status-renegociacao/card-status-renegociacao.component"
  as external to exclude it from the bundle, which will remove this error and leave the unresolved
  path in the bundle.

X [ERROR] Could not resolve "@app/shared/components/bsc-card/bsc-card.component"

    src/app/feature/acompanhamento/pages/assinatura-documentos/assinatura-documentos.component.ts:6:33:
      6 │ import { BscCardComponent } from '@app/shared/components/bsc-card/bsc-card.component';
        ╵                                  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  You can mark the path "@app/shared/components/bsc-card/bsc-card.component" as external to exclude
  it from the bundle, which will remove this error and leave the unresolved path in the bundle.

X [ERROR] Could not resolve "@app/shared/components/bsc-table/bsc-table.component"

    src/app/feature/acompanhamento/pages/assinatura-documentos/assinatura-documentos.component.ts:7:50:
      7 │ import { BscTableColumn, BscTableComponent } from '@app/shared/components/bsc-table/bsc-table.component';
        ╵                                                   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  You can mark the path "@app/shared/components/bsc-table/bsc-table.component" as external to
  exclude it from the bundle, which will remove this error and leave the unresolved path in the
  bundle.

X [ERROR] Could not resolve "@app/domain/store/renegociacao.store"

    src/app/feature/acompanhamento/pages/pagamento-da-entrada/pagamento-da-entrada.component.ts:8:34:
      8 │ import { RenegociacaoStore } from '@app/domain/store/renegociacao.store';
        ╵                                   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  You can mark the path "@app/domain/store/renegociacao.store" as external to exclude it from the
  bundle, which will remove this error and leave the unresolved path in the bundle.

X [ERROR] Could not resolve "@app/domain/ui/card-dados-do-pagamento/card-dados-do-pagamento.component"

    src/app/feature/acompanhamento/pages/detalhes-contrato/detalhes-contrato.component.ts:6:46:
      6 │ import { CardDadosDoPagamentoComponent } from '@app/domain/ui/card-dados-do-pagamento/card-dados-do-pagamento.component';
        ╵                                               ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  You can mark the path "@app/domain/ui/card-dados-do-pagamento/card-dados-do-pagamento.component"
  as external to exclude it from the bundle, which will remove this error and leave the unresolved
  path in the bundle.

X [ERROR] Could not resolve "@app/shared/pipes/moeda.pipe"

    src/app/feature/acompanhamento/pages/pagamento-da-entrada/pagamento-da-entrada.component.ts:9:26:
      9 │ import { MoedaPipe } from '@app/shared/pipes/moeda.pipe';
        ╵                           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  You can mark the path "@app/shared/pipes/moeda.pipe" as external to exclude it from the bundle,
  which will remove this error and leave the unresolved path in the bundle.

X [ERROR] Could not resolve "@app/domain/ui/card-pagamento-das-parcelas/card-pagamento-das-parcelas.component"

    src/app/feature/acompanhamento/pages/detalhes-contrato/detalhes-contrato.component.ts:7:50:
      7 │ import { CardPagamentoDasParcelasComponent } from '@app/domain/ui/card-pagamento-das-parcelas/card-pagamento-das-parcelas.component';
        ╵                                                   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  You can mark the path
  "@app/domain/ui/card-pagamento-das-parcelas/card-pagamento-das-parcelas.component" as external to
  exclude it from the bundle, which will remove this error and leave the unresolved path in the
  bundle.

X [ERROR] Could not resolve "@app/shared/utils/boleto.util"

    src/app/feature/acompanhamento/pages/pagamento-da-entrada/pagamento-da-entrada.component.ts:10:60:
      10 │ import { extrairValorBoleto, extrairVencimentoBoleto } from '@app/shared/utils/boleto.util';
         ╵                                                             ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  You can mark the path "@app/shared/utils/boleto.util" as external to exclude it from the bundle,
  which will remove this error and leave the unresolved path in the bundle.

X [ERROR] Could not resolve "@app/domain/ui/card-segunda-via-documentos/card-segunda-via-documentos.component"

    src/app/feature/acompanhamento/pages/detalhes-contrato/detalhes-contrato.component.ts:8:50:
      8 │ import { CardSegundaViaDocumentosComponent } from '@app/domain/ui/card-segunda-via-documentos/card-segunda-via-documentos.component';
        ╵                                                   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  You can mark the path
  "@app/domain/ui/card-segunda-via-documentos/card-segunda-via-documentos.component" as external to
  exclude it from the bundle, which will remove this error and leave the unresolved path in the
  bundle.

X [ERROR] Could not resolve "@app/shared/components/bsc-card/bsc-card.component"

    src/app/feature/acompanhamento/pages/detalhes-contrato/detalhes-contrato.component.ts:9:33:
      9 │ import { BscCardComponent } from '@app/shared/components/bsc-card/bsc-card.component';
        ╵                                  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  You can mark the path "@app/shared/components/bsc-card/bsc-card.component" as external to exclude
  it from the bundle, which will remove this error and leave the unresolved path in the bundle.

X [ERROR] Could not resolve "@app/domain/models/enums/status-contrato.enum"

    src/app/feature/acompanhamento/pages/detalhes-contrato/detalhes-contrato.component.ts:10:35:
      10 │ import { StatusContratoEnum } from '@app/domain/models/enums/status-contrato.enum';
         ╵                                    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  You can mark the path "@app/domain/models/enums/status-contrato.enum" as external to exclude it
  from the bundle, which will remove this error and leave the unresolved path in the bundle.

X [ERROR] Could not resolve "@app/domain/store/renegociacao.store"

    src/app/feature/acompanhamento/pages/detalhes-contrato/detalhes-contrato.component.ts:11:34:
      11 │ import { RenegociacaoStore } from '@app/domain/store/renegociacao.store';
         ╵                                   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  You can mark the path "@app/domain/store/renegociacao.store" as external to exclude it from the
  bundle, which will remove this error and leave the unresolved path in the bundle.

 ERRR  Error building federation artefacts
 ERRR  Build failed with 21 errors:
src/app/feature/acompanhamento/pages/assinatura-documentos/assinatura-documentos.component.ts:3:30: ERROR: Could not resolve "@app/core/services/router.service"
src/app/feature/acompanhamento/pages/assinatura-documentos/assinatura-documentos.component.ts:5:34: ERROR: Could not resolve "@app/domain/store/renegociacao.store"
src/app/feature/acompanhamento/pages/assinatura-documentos/assinatura-documentos.component.ts:6:33: ERROR: Could not resolve "@app/shared/components/bsc-card/bsc-card.component"
src/app/feature/acompanhamento/pages/assinatura-documentos/assinatura-documentos.component.ts:7:50: ERROR: Could not resolve "@app/shared/components/bsc-table/bsc-table.component"
src/app/feature/acompanhamento/pages/detalhes-contrato/detalhes-contrato.component.ts:3:42: ERROR: Could not resolve "@app/domain/ui/card-dados-cliente/card-dados-cliente.component"
...

I459249@N83461498N4294D MINGW64 ~/Documents/Projetos/recr-fed-agc-posvenda (feature/GPCNLS-6651)
$
```
