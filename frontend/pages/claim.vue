<script lang="ts" setup>
import { useAccount, useConnect, useWalletClient } from 'use-wagmi';
import SuccessSVG from '~/assets/images/success.svg';

definePageMeta({
  layout: 'claim',
});
useHead({
  title: 'Apillon POAP prebuilt solution',
});

const { query } = useRoute();
const router = useRouter();
const message = useMessage();
const { handleError } = useErrors();

const { address, isConnected } = useAccount();
const { data: walletClient, refetch } = useWalletClient();
const { connect, connectors, isLoading } = useConnect();

const loading = ref<boolean>(false);
const claimed = ref<boolean>(false);

onBeforeMount(() => {
  if (!query.token) {
    router.push('/');
  }
});

async function claimAirdrop() {
  loading.value = true;
  try {
    await refetch();
    const timestamp = new Date().getTime();

    if (!walletClient.value) {
      await connect({ connector: connectors.value[0] });

      if (!walletClient.value) {
        message.error('Could not connect with wallet');
        loading.value = false;
        return;
      }
    }

    const signature = await walletClient.value.signMessage({ message: `test\n${timestamp}` });
    const res = await $api.post<SuccessResponse>('/claim', {
      jwt: query.token?.toString() || '',
      signature,
      address: address.value,
      timestamp,
    });
    if (res.data && res.data.success) {
      message.success('You successfully claimed NFT');
      claimed.value = true;
    }
  } catch (e) {
    handleError(e);
  }
  loading.value = false;
}
</script>

<template>
  <!--<FormShare v-if="claimed" />-->
  <div v-if="claimed">
    <img :src="SuccessSVG" class="mx-auto" width="165" height="169" alt="airdrop" />

    <div class="my-8 text-center">
      <h3 class="mb-6">Great Success!</h3>
      <p>
        You have successfully received POAP NFT, which you can use to proove that you were part of
        the event.
      </p>
    </div>
  </div>
  <div v-else class="max-w-md w-full md:px-6 my-12 mx-auto">
    <img :src="SuccessSVG" class="mx-auto" width="165" height="169" alt="airdrop" />

    <div class="my-8 text-center">
      <h3 class="mb-6">Great Success!</h3>
      <p>
        To claim your POAP (NFT airdrop), you need to connect your EVM compatible wallet. This step
        is crucial for securely receiving and managing the airdropped NFTs.
      </p>
    </div>

    <Btn
      v-if="!isConnected"
      size="large"
      :loading="isLoading"
      @click="connect({ connector: connectors[0] })"
    >
      Connect wallet
    </Btn>
    <Btn v-else size="large" :loading="loading" @click="claimAirdrop()">Claim airdrop</Btn>
  </div>
</template>
