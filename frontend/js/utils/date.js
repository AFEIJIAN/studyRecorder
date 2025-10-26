function toInputDateString(dt) {
	let MM = `0${dt.getMonth() + 1}`.slice(-2);
	let DD = `0${dt.getDate()}`.slice(-2);

	return `${dt.getFullYear()}-${MM}-${DD}`;
}
