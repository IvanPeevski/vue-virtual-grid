<template>
  <smart-alert-window
    ref="alertWindowRef"
    :label="label"
    modal
    window-parent="body"
    header-buttons="[]"
    headerPosition="none"
    disable-snap="true"
    style="height: 150px"
  >
    <div class="w-full h-full flex justify-center items-center">
      <slot>{{ alertMsg }}</slot>
    </div>
  </smart-alert-window>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import "smart-webcomponents/source/modules/smart.window.js";

interface Props {
  label?: string;
}

const props = withDefaults(defineProps<Props>(), {
  label: "Atenção!",
});

const alertWindowRef = ref(null);

const alertMsg = ref("");

onMounted(() => {
  alertWindowRef.value.addEventListener("click", function (event) {
    if (event.target.closest(".smart-confirm-button")) {
      close();
    }
  });
});

const open = (msg: string = "") => {
  if (msg != "") {
    alertMsg.value = msg;
  }
  alertWindowRef.value.open();
};

const close = () => {
  alertWindowRef.value.close();
};

defineExpose({
  open,
  close,
});
</script>
