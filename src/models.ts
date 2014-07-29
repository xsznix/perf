interface DataFile {
	startBalance: number;
	endBalance: number;
	transactions: Transaction[];
}

interface Transaction {
	description: string;
	category: string;
	date: number;
}

interface Configuration {
	currencySymbol: string;
	// ...
}