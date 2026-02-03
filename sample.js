const DataFolder = require("datafolder");
const dataFolder = new DataFolder();

run();

async function run() {
	await dataFolder.start();
	dataFolder.insert("users/2026/user_0001", {
		userid: "user_0001",
		email: "a@b.com",
		password: "123",
		score: 5,
		address: { city: "a", zipcode: 123 },
	});
	dataFolder.insert("users/2026/user_0002", {
		userid: "user_0002",
		email: "c@b.com",
		password: "333",
		score: 3,
		address: { city: "b", zipcode: 321 },
	});
	const { email, password, address, score } = dataFolder.view("users/2026/user_0002");
	logger.log(email, password, score, address);
	address.zipcode = 678;
	dataFolder.insert("users/2026/user_0002", { score: score + 1, address });
	logger.log(dataFolder.view("users/2026/user_0002", ["score", "address"]));
	await dataFolder.stop();
	await dataFolder.start();
	{
		const file = dataFolder.file("users/2026/user_0002");
		const { email, password, score } = file.view();
		logger.log(email, password, score);
		dataFolder.insert(file, { score: score + 1 });
		logger.log(file.view());
	}
	await dataFolder.stop();
}
