<template>
  <AlertDialog ref="alertDlgRef" />
  <ConfirmDialog ref="confirmDlgRef" />
  <div :id="'div-' + gridId" class="nv-grid">
    <smart-grid :id="gridId" ref="refGrid" data-id="id"></smart-grid>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import "smart-webcomponents/source/modules/smart.grid.js";
import type {
  Grid,
  GridProperties,
  GridDataSourceSettings,
  DataAdapterVirtualDataSourceDetails,
} from "smart-webcomponents/source/typescript/smart.elements";
import { get_grid_pt_messages } from "@/shared/smart-locale";
import { fetchGet, fetchDelete, fetchPut } from "@/shared/fetch";
import AlertDialog from "@/components/AlertDialog.vue";
import ConfirmDialog from "@/components/ConfirmDialog.vue";

interface Props {
  refId?: string | null;
  dataFields: GridDataSourceSettings["dataFields"];
  columns: GridProperties["columns"];
  url: string;
  detailTemplate?: string;
  urlOps?: string;
  edit?: boolean;
  delete?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  refId: null,
  detailTemplate: "",
  urlOps: "",
  edit: false,
  delete: false,
});

interface SmartGridRemoteData {
  result: number;
  count: number;
  payload: Array<object>;
  aggregates: object;
}

interface RemoteSortData {
  sortBy: string;
  sortOrder: string;
}

interface RemoteFilterData {
  filterBy: string;
  filterType: string;
  filterCondition: string;
  filterValue: any;
}

const remoteUrl = ref(props.url);

const alertDlgRef = ref(null);
const confirmDlgRef = ref(null);
const refGrid = ref(null);

const gridId = computed((): string => {
  if (props.refId === null) {
    return `grid-div-${Math.floor(Date.now() * Math.random())}`;
  }
  return props.refId;
});

// @ts-ignore
window.customRemoveCommand = async function (row: any) {
  const confirm = await confirmDlgRef.value.open("Apagar a linha ?");
  if (confirm) {
    (refGrid.value! as Grid).deleteRow(row.id);
  }
};

// @ts-ignore
window.customEditCommand = function (row: any) {
  // This was an attempt of using validationRules .. but cannot achive to make them work!
  // Lot's of problems .. when the value does not validate and when cancel edit after
  const grid = row.grid;
  // grid.setColumnProperty("ano", "validationRules", [{ type: 'max', value: 20 }, { type: 'min', value: 1 }]);
  grid.beginEdit(row.id);
};

let sort: Array<RemoteSortData> = [];
let filter: Array<RemoteFilterData> = [];

let refreshOp = 0;

const refresh = (pgrid: Grid = null) => {
  // console.log("REFRESH")
  refreshOp = 2;
  if (filter.length > 0) {
    refreshOp += 1;
  }

  let grid = null;
  if (pgrid === null) {
    grid = refGrid.value! as Grid;
  } else {
    grid = pgrid;
  }
  const tmp = grid!.dataSource;
  grid.dataSource = [];
  grid.dataSource = tmp;
  // grid.dataBind();
};

const dataSource = new window.Smart.DataAdapter({
  VirtualDataSourceCache: false,
  virtualDataSource: async function (
    resultCallbackFunction: any,
    details: DataAdapterVirtualDataSourceDetails
  ) {
    debugger;
    // console.log(details.action);

    // All this logic is to prevent several (sometimes 3 or 4...) requests to the server
    // it's done one for binding, for sort, for filter etc etc
    // in the beginning and when doing a grid refresh with refresh function above!
    // ------------------------------------------------------->>>>>>
    if (details.action == "dataBind" && refreshOp > 0) {
      // console.log("DATABIND - REFRESH")
      refreshOp -= 1;
    } else if (details.action == "dataBind") {
      // console.log("DATABIND")
      return;
    } else if (details.action == "sort" && refreshOp > 0) {
      // console.log("SORT - REFRESH")
      refreshOp -= 1;
      return;
    } else if (details.action == "filter" && refreshOp > 0) {
      // console.log("FILTER - REFRESH")
      refreshOp -= 1;
      return;
    } else if (details.action == "remove") {
      const res = await fetchDelete(
        encodeURI(`${props.urlOps}${details.edit.row.id}/`)
      );
      resultCallbackFunction({
        dataSource: [],
        virtualDataSourceLength: 0,
      });
      return;
    } else if (details.action == "update") {
      const res = await fetchPut(
        encodeURI(`${props.urlOps}${details.edit.row.id}/`),
        details.edit.row
      );
      if (!res.success) {
        alertDlgRef.value.open(res.error);
      }
      resultCallbackFunction({
        dataSource: [],
        virtualDataSourceLength: 0,
      });
      return;
    }

    console.log("INVOKE SERVER!!");

    if (refreshOp == 0) {
      sort = [];
      if (details.sorting.length > 0) {
        for (const s in details.sorting) {
          sort.push({
            sortBy: s,
            sortOrder: details.sorting[s].sortOrder,
          });
        }
      }
      filter = [];
      if (details.filtering.length > 0) {
        for (const f in details.filtering) {
          filter.push({
            filterBy: f,
            filterType: details.filtering[f].filters[0].type,
            filterCondition: details.filtering[f].filters[0].condition,
            filterValue: details.filtering[f].filters[0].value,
          });
        }
      }
    }

    const res = await fetchGet(
      encodeURI(
        `${remoteUrl.value}?first=${details.first}&last=${
          details.last
        }&sorting=${JSON.stringify(sort)}&filter=${JSON.stringify(filter)}`
      )
    );
    resultCallbackFunction({
      dataSource: res.payload,
      virtualDataSourceLength: res.count,
    });
  },
  id: "id",
  dataFields: props.dataFields,
});

onMounted(() => {
  // ---------------
  // Have to do this because update fails to show the edit value!
  // It's commented or it would fetch the same mocking values!
  // ---------------
  // const grid = refGrid.value as Grid;
  // grid.addEventListener('endEdit', function (event) {
  //   setTimeout(()=> {
  //     refresh(grid);
  //   }, 200)
  // });

  window.Smart(
    `#${gridId.value}`,
    class {
      get properties() {
        let gridProperties = {
          dataSource: dataSource,

          columns: props.columns,

          locale: "pt",
          messages: get_grid_pt_messages(),

          appearance: {
            placeholder: "Sem dados",
            allowRowDetailToggleAnimation: true,
          },

          sorting: {
            enabled: true,
            mode: "one",
          },

          filtering: {
            enabled: true,
            filterRow: {
              visible: true,
              applyMode: "click",
            },
          },

          grouping: {
            enabled: false,
          },

          paging: {
            enabled: true,
            pageSize: 25,
          },

          pager: {
            visible: true,
            summary: {
              visible: true,
            },
          },

          selection: {
            enabled: true,
            mode: "one",
            action: "click",
          },
        };

        if (props.edit || props.delete) {
          gridProperties["editing"] = {
            enabled: true,
            action: "none",
            mode: "row",
            commandColumn: {
              visible: true,
              displayMode: "icon",
              dataSource: {
                commandColumnEdit: {
                  visible: false,
                },
                commandColumnDelete: {
                  visible: false,
                },
              },
            },
          };

          if (props.edit) {
            gridProperties["editing"]["commandColumn"]["dataSource"][
              "commandColumnEdit"
            ] = {
              visible: true,
              // icon: "smart-icon-edit",
              // command: "customEditCommand",
              // label: "Text"
            };
          }
          if (props.delete) {
            gridProperties["editing"]["commandColumn"]["dataSource"][
              "commandColumnCustom"
            ] = {
              visible: true,
              icon: "smart-icon-delete",
              command: "customRemoveCommand",
              label: "Text",
            };
          }
        }

        if (props.detailTemplate !== "") {
          gridProperties["rowDetail"] = {
            enabled: true,
            visible: true,
            template: props.detailTemplate,
          };
        }

        return gridProperties;
      }
    }
  );
});

watch(
  () => props.url,
  (newUrl, oldUrl) => {
    remoteUrl.value = newUrl;
    refresh();
  }
);

defineExpose({
  refresh,
});
</script>

<style>
.nv-grid smart-grid-column {
  /* color: white; */
  /* background-color: #70753F; */
  /* color: #005c99; */
  font-size: 13px;
  font-weight: bold;
}

.nv-grid smart-grid {
  font-size: 12px;
  width: 100%;
  /* 100hv - header - (margin-top + margin-bottom) - tittle */
  height: calc(100vh - 64px - 8px - 115px);
  /* height: auto; */
}

.nv-grid smart-grid:focus-visible {
  outline: unset;
}

.nv-grid
  smart-grid-row[selected]:not([selected="indeterminate"]):not(
    [selected]
      + smart-grid-row[selected]:not([selected="indeterminate"]):not(
        [selected="none"]
      )
  )
  smart-grid-cell[selected]:not([editor]):not([header]):not(
    .smart-add-new-column
  ) {
  background: #005c99; /* #322d46 */
  color: white;
}
</style>
