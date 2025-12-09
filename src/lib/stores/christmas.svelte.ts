export const christmasState = $state({
	isSnowing: false,
	triggerSnow() {
		this.isSnowing = true;
	},
	stopSnow() {
		this.isSnowing = false;
	}
});
