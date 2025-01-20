<template>
	<UContainer>
		<h1 class="text-3xl font-bold text-center py-4">Catat Transaksi</h1>

		<UModal v-model="showModal">
			<UCard
				class="w-full pa-4"
				:ui="{
					base: '',
					ring: '',
					divide: 'divide-y divide-gray-200 dark:divide-gray-700',
					header: { padding: 'px-4 py-5' },
					body: {
						padding: '',
						base: 'divide-y divide-gray-200 dark:divide-gray-700',
					},
					footer: { padding: 'p-4' },
				}"
			>
				<template #header>
					<h2
						class="font-semibold text-xl text-gray-900 dark:text-white leading-tight"
					>
						Form Transaksi
					</h2>
				</template>

				<!-- Form Input -->
				<UForm
					:schema="schema"
					:state="state"
					class="space-y-4 p-4 m-4"
					@submit="submitTransaction"
				>
					<UFormGroup label="Nama Barang" name="name">
						<UInput v-model="state.name" placeholder="Nama Barang" />
					</UFormGroup>

					<UFormGroup label="Jumlah" name="quantity">
						<UInput
							v-model.number="state.quantity"
							type="number"
							placeholder="Jumlah"
						/>
					</UFormGroup>

					<UFormGroup label="Harga Jual" name="sellingPrice">
						<UInput
							v-model.number="state.sellingPrice"
							type="number"
							placeholder="Harga Jual"
						/>
					</UFormGroup>

					<UFormGroup label="Harga Beli" name="buyingPrice">
						<UInput
							v-model.number="state.buyingPrice"
							type="number"
							placeholder="Harga Beli"
						/>
					</UFormGroup>

					<UFormGroup label="Tipe" name="type">
						<USelect v-model="state.type">
							<option value="income">Pemasukan</option>
							<option value="expense">Pengeluaran</option>
						</USelect>
					</UFormGroup>

					<UButton type="submit">Simpan</UButton>
				</UForm>
			</UCard>
		</UModal>

		<!-- Tabel Transaksi -->
		<UCard
			class="w-full my-12"
			:ui="{
				base: '',
				ring: '',
				divide: 'divide-y divide-gray-200 dark:divide-gray-700',
				header: { padding: 'px-4 py-5' },
				body: {
					padding: '',
					base: 'divide-y divide-gray-200 dark:divide-gray-700',
				},
				footer: { padding: 'p-4' },
			}"
		>
			<template #header>
				<div class="flex items-center justify-between gap-3 px-4 py-3">
					<h2
						class="font-semibold text-xl text-gray-900 dark:text-white leading-tight"
					>
						Daftar Transaksi
					</h2>
					<UButton @click="showModal = true">Tambah Transaksi</UButton>
				</div>
			</template>

			<!-- Filters -->
			<div class="flex items-center justify-between gap-3 px-4 py-3">
				<UInput
					v-model="search"
					icon="i-heroicons-magnifying-glass-20-solid"
					placeholder="Search..."
				/>
				<USelect
					v-model="selectedType"
					:options="transactionTypes"
					placeholder="Tipe"
					class="w-40"
				/>
			</div>

			<!-- Header and Action buttons -->
			<div class="flex justify-between items-center w-full px-4 py-3">
				<div class="flex items-center gap-1.5">
					<span class="text-sm leading-5">Rows per page:</span>
					<USelect
						v-model="itemsPerPage"
						:options="[5, 10, 20, 30]"
						class="me-2 w-20"
						size="xs"
					/>
				</div>

				<div class="flex gap-1.5 items-center">
					<UButton
						icon="i-heroicons-funnel"
						color="gray"
						size="xs"
						@click="resetFilters"
					>
						Reset
					</UButton>
				</div>
			</div>

			<!-- Table -->
			<UTable
				v-model="selectedRows"
				:rows="paginatedTransactions"
				:columns="columns"
				:loading="loading"
				sort-asc-icon="i-heroicons-arrow-up"
				sort-desc-icon="i-heroicons-arrow-down"
				sort-mode="manual"
				class="w-full"
				:ui="{ td: { base: 'max-w-[0] truncate' }, default: { checkbox: { color: 'gray' as any } } }"
			>
				<template #actions-data="{ row }">
					<UButton
						icon="i-heroicons-trash"
						size="2xs"
						color="red"
						variant="outline"
						@click="deleteTransaction(row.id)"
					/>
				</template>
			</UTable>

			<!-- Number of rows & Pagination -->
			<template #footer>
				<div class="flex flex-wrap justify-between items-center">
					<div>
						<span class="text-sm leading-5">
							Showing
							<span class="font-medium">{{ pageFrom }}</span>
							to
							<span class="font-medium">{{ pageTo }}</span>
							of
							<span class="font-medium">{{ pageTotal }}</span>
							results
						</span>
					</div>

					<UPagination
						v-model="page"
						:page-count="pageCount"
						:total="pageTotal"
						:ui="{
							wrapper: 'flex items-center gap-1',
							rounded: '!rounded-full min-w-[32px] justify-center',
							default: {
								activeButton: {
									variant: 'outline',
								},
							},
						}"
					/>
				</div>
			</template>
		</UCard>

		<!-- Toast Notification -->
		<UToast
			v-if="toastMessage"
			:message="toastMessage"
			@close="toastMessage = ''"
		/>
	</UContainer>
</template>

<script setup lang="ts">
	import { ref, reactive, onMounted, computed } from 'vue';
	import axios from 'axios'; // Import Axios
	import { z } from 'zod';

	// Definisikan tipe data untuk transaksi
	interface Transaction {
		name: string;
		quantity: number;
		sellingPrice: number;
		buyingPrice: number;
		type: string;
		id: number;
		createdAt: Date;
	}

	// Schema untuk validasi form
	const schema = z.object({
		name: z.string().min(1, 'Nama barang tidak boleh kosong'),
		quantity: z.number().min(1, 'Jumlah harus lebih dari 0'),
		sellingPrice: z.number().min(0, 'Harga jual tidak boleh negatif'),
		buyingPrice: z.number().min(0, 'Harga beli tidak boleh negatif'),
		type: z.enum(['income', 'expense']),
	});

	// State untuk form
	const state = reactive({
		name: '',
		quantity: 0,
		sellingPrice: 0,
		buyingPrice: 0,
		type: 'income',
	});

	// State untuk transaksi
	const transactions = ref<Transaction[]>([]);
	const loading = ref(false);
	const showModal = ref(false);
	const selectedRows = ref([]);
	const search = ref('');
	const page = ref(1);
	const itemsPerPage = ref(10); // Set jumlah item per halaman
	const toastMessage = ref('');
	const selectedType = ref(''); // For filtering by type

	const transactionTypes = [
		{ value: '', label: 'All' },
		{ value: 'income', label: 'Pemasukan' },
		{ value: 'expense', label: 'Pengeluaran' },
	];

	// Columns for the table
	const columns = [
		{ key: 'name', label: 'Nama Barang', sortable: true },
		{ key: 'quantity', label: 'Jumlah', sortable: true },
		{ key: 'sellingPrice', label: 'Harga Jual', sortable: true },
		{ key: 'buyingPrice', label: 'Harga Beli', sortable: true },
		{ key: 'type', label: 'Tipe', sortable: true },
		{ key: 'actions', label: 'Actions', sortable: false },
	];

	// Fetch transactions from API
	const fetchTransactions = async () => {
		loading.value = true; // Set loading true saat mulai fetch
		try {
			const response = await axios.get('/api/transactions');
			transactions.value = response.data || [];
		} catch (error) {
			console.error('Error fetching transactions:', error);
		} finally {
			loading.value = false; // Set loading false setelah fetch selesai
		}
	};

	const resetFilters = () => {
		search.value = '';
		selectedType.value = '';
	};

	// Computed property for filtered transactions
	const filteredTransactions = computed(() => {
		return transactions.value.filter((transaction) => {
			const matchesSearch = transaction.name
				.toLowerCase()
				.includes(search.value.toLowerCase());
			const matchesType = selectedType.value
				? transaction.type === selectedType.value
				: true;
			return matchesSearch && matchesType;
		});
	});

	// Computed property for paginated transactions
	const paginatedTransactions = computed(() => {
		const start = (page.value - 1) * itemsPerPage.value;
		return filteredTransactions.value.slice(start, start + itemsPerPage.value);
	});

	// Computed property for total pages
	const pageCount = computed(() => {
		return Math.ceil(pageTotal.value / itemsPerPage.value);
	});

	// Computed properties for pagination display
	const pageTotal = computed(() => filteredTransactions.value.length);
	const pageFrom = computed(() => (page.value - 1) * itemsPerPage.value + 1);
	const pageTo = computed(() =>
		Math.min(page.value * itemsPerPage.value, pageTotal.value)
	);

	// Submit new transaction
	const submitTransaction = async () => {
		try {
			// Validasi data
			schema.parse(state);

			await axios.post('/api/transactions', {
				name: state.name,
				quantity: state.quantity,
				sellingPrice: state.sellingPrice,
				buyingPrice: state.buyingPrice,
				type: state.type,
			});
			toastMessage.value = 'Transaksi berhasil ditambahkan!';
			await fetchTransactions(); // Ambil data transaksi setelah submit
			resetForm();
		} catch (error) {
			console.error('Error submitting transaction:', error);
		}
	};

	// Reset form fields
	const resetForm = () => {
		state.name = '';
		state.quantity = 0;
		state.sellingPrice = 0;
		state.buyingPrice = 0;
		state.type = 'income';
		showModal.value = false; // Close modal after reset
	};

	// Delete transaction
	const deleteTransaction = async (id: number) => {
		try {
			await axios.delete(`/api/transactions/${id}`);
			toastMessage.value = 'Transaksi berhasil dihapus!';
			await fetchTransactions(); // Refresh data setelah penghapusan
		} catch (error) {
			console.error('Error deleting transaction:', error);
		}
	};

	// Request permission for notifications
	const requestPermission = () => {
		if ('Notification' in window) {
			Notification.requestPermission().then((permission) => {
				if (permission === 'granted') {
					console.log('Notification permission granted.');
				} else {
					console.log('Notification permission denied.');
				}
			});
		} else {
			console.error('Notifikasi tidak didukung di browser ini.');
		}
	};

	// Request permission when the component is mounted
	onMounted(() => {
		requestPermission();
		fetchTransactions(); // Ambil data transaksi saat komponen dimuat
	});
</script>

<style scoped>
	.loading {
		font-size: 1.2em;
		color: blue;
	}
</style>
