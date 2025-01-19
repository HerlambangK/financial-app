<template>
	<div>
		<NuxtRouteAnnouncer />
		<NuxtLoadingIndicator />
		<nav>
			<NuxtLink to="/">Home</NuxtLink>
			<NuxtLink to="/transactions">Transaksi</NuxtLink>
			<NuxtLink to="/reports">Laporan</NuxtLink>
		</nav>
		<NuxtPage />
		<footer>
			<p>
				&copy; {{ new Date().getFullYear() }} Pencatatan Keuangan. Semua hak
				dilindungi.
			</p>
		</footer>
	</div>
</template>

<script setup>
	import { ref } from 'vue';

	const name = ref('');
	const quantity = ref(0);
	const sellingPrice = ref(0);
	const buyingPrice = ref(0);
	const type = ref('income');

	const submitTransaction = async () => {
		// Logika untuk mengirim data transaksi ke API
	};
</script>

<style scoped>
	nav {
		background-color: #f8f9fa;
		padding: 1rem;
	}

	nav a {
		margin-right: 1rem;
		text-decoration: none;
		color: #007bff;
	}

	footer {
		text-align: center;
		padding: 1rem;
		background-color: #f8f9fa;
		position: fixed;
		width: 100%;
		bottom: 0;
	}
</style>
