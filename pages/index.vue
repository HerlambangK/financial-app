<template>
	<div>
		<h1>Catat Transaksi</h1>
		<form @submit.prevent="submitTransaction">
			<input v-model="name" placeholder="Nama Barang" required />
			<input
				v-model.number="quantity"
				type="number"
				placeholder="Jumlah"
				required
			/>
			<input
				v-model.number="sellingPrice"
				type="number"
				placeholder="Harga Jual"
				required
			/>
			<input
				v-model.number="buyingPrice"
				type="number"
				placeholder="Harga Beli"
				required
			/>
			<select v-model="type">
				<option value="income">Pemasukan</option>
				<option value="expense">Pengeluaran</option>
			</select>
			<button type="submit">Simpan</button>
		</form>

		<h2>Daftar Transaksi</h2>
		<ul>
			<li v-for="(transaction, index) in transactions" :key="index">
				{{ transaction.name }} - Jumlah: {{ transaction.quantity }}
			</li>
		</ul>

		<!-- Loading Indicator -->
		<div v-if="loading" class="loading">Loading...</div>
	</div>
</template>

<script setup lang="ts">
	import { ref, onMounted } from 'vue';
	import axios from 'axios'; // Import Axios

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

	const name = ref('');
	const quantity = ref(0);
	const sellingPrice = ref(0);
	const buyingPrice = ref(0);
	const type = ref('income');
	const transactions = ref<Transaction[]>([]);
	const loading = ref(false); // State untuk loading
	let totalQuantity = ref(0); // Menyimpan total jumlah barang

	const fetchTransactions = async () => {
		loading.value = true; // Set loading true saat mulai fetch
		try {
			const response = await axios.get('/api/transactions');
			transactions.value = response.data || [];
			totalQuantity.value = transactions.value.reduce(
				(sum, transaction) => sum + transaction.quantity,
				0
			); // Hitung total quantity
			console.log('data', response.data);
			console.log('transactions.value', transactions.value);
		} catch (error) {
			console.error('Error fetching transactions:', error);
		} finally {
			loading.value = false; // Set loading false setelah fetch selesai
		}
	};

	const submitTransaction = async () => {
		if (
			!name.value ||
			quantity.value === null ||
			sellingPrice.value === null ||
			buyingPrice.value === null
		) {
			console.error('Data tidak lengkap');
			return;
		}

		try {
			const response = await axios.post('/api/transactions', {
				name: name.value,
				quantity: quantity.value,
				sellingPrice: sellingPrice.value,
				buyingPrice: buyingPrice.value,
				type: type.value,
			});
			await fetchTransactions(); // Ambil data transaksi setelah submit

			// Hitung total quantity setelah transaksi baru ditambahkan
			totalQuantity.value = transactions.value.reduce(
				(sum, transaction) => sum + transaction.quantity,
				0
			);

			// Notifikasi saat barang bertambah
			if (quantity.value > 0) {
				sendNotification(`Barang bertambah: ${name.value} (${quantity.value})`);
			}

			// Reset form
			name.value = '';
			quantity.value = 0;
			sellingPrice.value = 0;
			buyingPrice.value = 0;
			type.value = 'income';
		} catch (error) {
			console.error('Error submitting transaction:', error);
		}
	};

	// Fungsi untuk mengirim notifikasi
	const sendNotification = (message: string) => {
		if (Notification.permission === 'granted') {
			new Notification('Notifikasi Transaksi', {
				body: message,
				icon: '/logo.png',
			});
		}
	};

	// Request permission for notifications
	const requestPermission = () => {
		Notification.requestPermission().then((permission) => {
			if (permission === 'granted') {
				console.log('Notification permission granted.');
				startNotifications();
			} else {
				console.log('Notification permission denied.');
			}
		});
	};

	// Function to send notifications every 20 seconds
	const startNotifications = () => {
		console.log('Starting notifications...');
		setInterval(() => {
			if (Notification.permission === 'granted') {
				const notification = new Notification('Pengingat Barang', {
					body: `Total barang saat ini: ${totalQuantity.value}`,
					icon: '/logo.png',
				});
				notification.onclick = () => {
					console.log('Notification clicked');
				};
			}
		}, 20000); // Set interval to 20 seconds
	};

	// Request permission when the component is mounted
	onMounted(() => {
		requestPermission();
		startNotifications();
		fetchTransactions(); // Ambil data transaksi saat komponen dimuat
	});
</script>

<style scoped>
	/* Tambahkan styling sesuai kebutuhan */
	.loading {
		font-size: 1.2em;
		color: blue;
	}
</style>
