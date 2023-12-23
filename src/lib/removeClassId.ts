export default function removeClassID(name: string) {
	return name.replace(/ \([A-Z]+\) \([0-9]+\)$/, '');
}
