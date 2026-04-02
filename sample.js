import DataFolder, { logger } from "datafolder";
const dataFolder = new DataFolder();

run();

async function run() {
	await dataFolder.start();
	dataFolder.insert("traindata/2026/1/20/chat_0001", {
		userid: "user_0001",
		email: "a@b.com",
		feedbackScore: 5,
		address: { city: "a", zipcode: 123 },
	});
	dataFolder.insert("traindata/2026/1/20/chat_0001/prompt", "What is async/await?");
	dataFolder.insert("traindata/2026/1/20/chat_0001/answer", "async/await is ...");
	const { userid, email, address, feedbackScore } = dataFolder.view("traindata/2026/1/20/chat_0001");
	logger.log(userid, email, feedbackScore, address);
	address.zipcode = 678;
	dataFolder.insert("traindata/2026/1/20/chat_0001", { feedbackScore: feedbackScore + 1, address });
	logger.log(dataFolder.view("traindata/2026/1/20/chat_0001", ["feedbackScore", "address"]));
	logger.debug(dataFolder.view("traindata/2026/1/20/chat_0001/prompt"));
	logger.warn(dataFolder.view("traindata/2026/1/20/chat_0001/answer"));
	await dataFolder.stop();
	await dataFolder.start();
	{
		const file = dataFolder.file("traindata/2026/1/20/chat_0001");
		const { email, feedbackScore } = file.view();
		logger.log(email, feedbackScore);
		dataFolder.insert(file, { feedbackScore: feedbackScore + 1 });
		logger.error(
			file.view(),
			dataFolder.view("traindata/2026/1/20/chat_0001/prompt"),
			dataFolder.view("traindata/2026/1/20/chat_0001/answer"),
		);
	}
	await dataFolder.stop();
}
