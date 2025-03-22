<script setup>
// Import only what's needed from Vue
import { ref } from "@lynx-js/vue";

const title = "Hello VueLynx";
const message = "Welcome to Vue 3 in Lynx!";
const count = ref(0);

function increment() {
  count.value++;
}
</script>

<template>
  <view>
    <text style="font-size: 24px; font-weight: bold; margin-bottom: 8px"
      >Vue</text
    >
    <text style="font-size: 18px; color: #666; margin-bottom: 16px"
      >on Lynx</text
    >
    <text style="color: #42b983; font-size: 20px">{{ title }}</text>
    <text>{{ message }}</text>
    <button
      @click="increment"
      style="
        background-color: #42b983;
        border: none;
        color: white;
        padding: 8px 16px;
        border-radius: 4px;
        margin-top: 8px;
      "
    >
      Count: {{ count }}
    </button>
  </view>
</template>
