<template>
  <div v-if="poapStore.poap" class="grid justify-items-center">
    <h1>{{ poapStore.poap.title }} - Lottery Winners</h1>
    <div v-if="poapStatus == 2" class="w-full p-16">
      <h2>Lottery Winners</h2>
      <div class="flex">
        <div
          class="flex flex-col items-center p-2 rounded-md mr-4"
          style="background-color: #1e212b; width: 150px"
        >
          <span class="font-bold" style="font-size: xx-large">{{
            poapStore.reservations.total
          }}</span>
          <p style="font-size: x-small">Total Participants</p>
        </div>
      </div>
      <div class="mt-8">
        <n-data-table :columns="winnerColumns" :data="winnerData" :bordered="false" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import dayjs from 'dayjs';
import { ref, onMounted, watch, computed } from 'vue';
import { useRoute } from 'vue-router';
import { DataTableColumns } from 'naive-ui/es/data-table';

const { params } = useRoute();
const poapStore = usePoapDropStore();

/**
 * 0 = Not yet started, 1 = In progress, 2 = Finished
 */
const poapStatus = ref(0);
const winners = ref<string[]>([]);

const winnerColumns: DataTableColumns<any> = [
  {
    title: 'Type',
    key: 'prize',
    minWidth: 150,
  },

  {
    title: 'Prize Name',
    key: 'prizeName',
    minWidth: 250,
  },
  {
    title: 'Winner',
    key: 'winner',
    minWidth: 250,
  },
];

const winnerData = computed(() => {
  return [
    {
      prize: 'First Prize',
      winner: winners.value[0] || 'N/A',
      prizeName: poapStore.poap.lotteryPrize1 || 'N/A',
    },
    {
      prize: 'Second Prize',
      winner: winners.value[1] || 'N/A',
      prizeName: poapStore.poap.lotteryPrize2 || 'N/A',
    },
    {
      prize: 'Third Prize',
      winner: winners.value[2] || 'N/A',
      prizeName: poapStore.poap.lotteryPrize3 || 'N/A',
    },
  ];
});

onMounted(async () => {
  await poapStore.getPoapDrop(params.slug);
  console.log('Poap Data:', poapStore.poap); // Check if data is fetched
  await poapStore.getPoapDropReservations(params.slug);
  console.log('Reservations Data:', poapStore.reservations); // Check if reservations are fetched
  if (poapStore.poap) {
    calculatePoapStatus();
    if (poapStatus.value == 2) {
      winners.value = poapStore.poap.winners ? poapStore.poap.winners.split(',') : [];
      console.log('Winners:', winners.value); // Check winners data
    }
  }
});

watch(poapStore.poap, newVal => {
  console.log('Updated Poap Data:', newVal);
});

function calculatePoapStatus() {
  const currDate = dayjs(new Date());
  const startTime = dayjs(poapStore.poap?.startTime);
  const endTime = dayjs(poapStore.poap?.endTime);

  if (currDate.isAfter(startTime)) {
    if (currDate.isBefore(endTime)) {
      // Event is running
      poapStatus.value = 1;
    } else {
      // Event has ended
      poapStatus.value = 2;
    }
  } else {
    poapStatus.value = 0;
  }
}
</script>

<style scoped>
.winner-list {
  list-style-type: none;
  padding: 0;
}
.winner-item {
  margin-bottom: 0.5rem;
  font-size: 1.2rem;
  color: #ddd;
}
</style>
