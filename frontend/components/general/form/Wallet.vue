<script lang="ts" setup>
import { useConnect } from 'use-wagmi';
import WalletSVG from '~/assets/images/wallet.svg';

const { connect, connectors, pendingConnector } = useConnect();
</script>

<template>
  <div class="max-w-md w-full md:px-6 my-12 mx-auto">
    <img :src="WalletSVG" class="mx-auto" width="241" height="240" alt="wallet" />

    <div class="my-8 text-center">
      <h3 class="mb-6">Choose wallet</h3>
    </div>

    <n-space size="large" vertical>
      <Btn
        v-for="(connector, key) in connectors"
        :key="key"
        type="secondary"
        size="large"
        :loading="connector.id === pendingConnector?.id"
        :disabled="!connector.ready"
        @click="connect({ connector })"
      >
        <span class="inline-flex gap-2 items-center">
          <NuxtIcon :name="connector.id" class="text-xl" filled />
          <span>{{ connector.name }}</span>
        </span>
      </Btn>
    </n-space>
  </div>
</template>
