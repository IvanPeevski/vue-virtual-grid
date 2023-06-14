<template>
  <div style="width: 100%">
    <GridRemote
      refId="anexo1-grid"
      :dataFields="anexo1Fields"
      :columns="anexo1Columns"
      :url="'/dcp/anexo1_list/'"
      :detailTemplate="anexo1DetailTemplate"
      :urlOps="'/dcp/anexo1/'"
      :edit="true"
    ></GridRemote>
  </div>
</template>

<script setup lang="ts">
import { ref, onBeforeMount, onMounted, watchEffect } from "vue";
import "smart-webcomponents/source/modules/smart.grid.js";
import type {
  GridProperties,
  GridDataSourceSettings,
} from "smart-webcomponents/source/typescript/smart.elements";
import GridRemote from "@/components/GridRemote.vue";
import "smart-webcomponents/source/styles/smart.default.css";

const anexo1DetailTemplate = ref(
  `<div style="margin-left: 20px; margin-top: 20px; height: 100px"><span class="font-bold">Observação:</span> {{obs}}</div>`
);

const anexo1Fields: GridDataSourceSettings["dataFields"] = [
  { name: "id", dataType: "string" },
  { name: "geocodigo", dataType: "string" },
  { name: "nome", dataType: "string" },
  { name: "ano_plantacao", dataType: "number" },
  { name: "area_casta", dataType: "number" },
  { name: "cor", dataType: "string" },
  { name: "casta", dataType: "string" },
  { name: "rend_ha_vv", dataType: "number" },
  { name: "rend_ha_ig", dataType: "number" },
  { name: "rend_ha_v", dataType: "number" },
  { name: "area_producao", dataType: "number" },
  { name: "autoconsumo", dataType: "boolean" },
  { name: "obs", dataType: "string" },
];

const anexo1Columns: GridProperties["columns"] = [
  {
    label: "ID",
    dataField: "id",
    dataType: "string",
    visible: false,
    allowEdit: false,
    sortOrder: "desc",
  },
  {
    label: "Geocódigo",
    dataField: "geocodigo",
    dataType: "string",
    allowEdit: false,
  },
  { label: "Nome", dataField: "nome", dataType: "string", allowEdit: false },
  {
    label: "Ano Plantação",
    dataField: "ano_plantacao",
    dataType: "number",
    allowEdit: false,
  },
  {
    label: "Área",
    dataField: "area_casta",
    dataType: "number",
    allowEdit: false,
  },
  { label: "Cor", dataField: "cor", dataType: "string", allowEdit: false },
  { label: "Casta", dataField: "casta", dataType: "string", allowEdit: false },
  {
    label: "Rend. Ha VV",
    dataField: "rend_ha_vv",
    dataType: "number",
    allowEdit: false,
  },
  {
    label: "Rend. Ha IG",
    dataField: "rend_ha_ig",
    dataType: "number",
    allowEdit: false,
  },
  {
    label: "Rend. Ha V",
    dataField: "rend_ha_v",
    dataType: "number",
    allowEdit: false,
  },
  {
    label: "Auto Consumo",
    dataField: "autoconsumo",
    dataType: "boolean",
    template: "checkBox",
    allowEdit: false,
  },
  {
    label: "Área Produção",
    dataField: "area_producao",
    dataType: "number",
    allowEdit: true,
    editor: "numberInput",
    cellsFormat: "f4",
  },
];
</script>

<style></style>
