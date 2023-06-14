<template>
  <smart-window
    ref="confirmWindowRef"
    :label="label"
    modal
    window-parent="body"
    header-buttons="[]"
    headerPosition="top"
    disable-snap="true"
    style="height: 150px"
  >
    <div class="w-full h-full flex justify-center items-center">
      <slot>{{ confirmMsg }}</slot>
    </div>

    <div class="mt-auto">
      <smart-button class="primary" @click="yesBtnClick">Sim</smart-button>
      &nbsp;
      <smart-button @click="noBtnClick">Não</smart-button>
    </div>
  </smart-window>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import "smart-webcomponents/source/modules/smart.window.js";
import "smart-webcomponents/source/modules/smart.button.js";

interface Props {
  label?: string;
}

const props = withDefaults(defineProps<Props>(), {
  label: "Confirmação",
});

const confirmWindowRef = ref(null);

const confirmMsg = ref("");

onMounted(() => {});

const yesBtnClick = (e: any) => {
  confirmWindowRef.value.dispatchEvent(new Event("nv-confirm-yes"));
  close();
};

const noBtnClick = (e: any) => {
  confirmWindowRef.value.dispatchEvent(new Event("nv-confirm-no"));
  close();
};

const waitForUser = () => {
  return new Promise((resolve) => {
    confirmWindowRef.value.addEventListener(
      "nv-confirm-no",
      () => {
        close();
        resolve(false);
      },
      { once: true }
    );
    confirmWindowRef.value.addEventListener(
      "nv-confirm-yes",
      () => {
        close();
        resolve(true);
      },
      { once: true }
    );
  });
};

const open = (msg: string = "") => {
  if (msg != "") {
    confirmMsg.value = msg;
  }
  confirmWindowRef.value.open();
  return waitForUser();
};

const close = () => {
  confirmWindowRef.value.close();
};

defineExpose({
  open,
  close,
});
</script>
