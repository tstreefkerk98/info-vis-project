import {Injectable} from '@angular/core';

@Injectable({
	providedIn: 'root'
})
export class ColorService {

	constructor() {
	}

	saturateHexs(hex: string, n: number) {
		const rgb = this.hex2rgb(hex);
		const hsv = this.rgb2hsv(rgb);
		const step = hsv[1] / n;
		const newHexs = [];
		for (let i = 0; i < n; i++) {
			const newRgb = this.hsv2rgb([hsv[0], hsv[1] - i * step, hsv[2]]);
			newHexs.push(this.rgb2hex(newRgb));
		}
		return newHexs;
	}

	rgb2hsv(rgb: number[]) {
		let r = rgb[0];
		let g = rgb[1];
		let b = rgb[2];
		let max = Math.max(r, g, b), min = Math.min(r, g, b),
			d = max - min,
			h,
			s = (max === 0 ? 0 : d / max),
			v = max / 255;

		switch (max) {
			case min:
				h = 0;
				break;
			case r:
				h = (g - b) + d * (g < b ? 6 : 0);
				h /= 6 * d;
				break;
			case g:
				h = (b - r) + d * 2;
				h /= 6 * d;
				break;
			case b:
				h = (r - g) + d * 4;
				h /= 6 * d;
				break;
		}

		return [h, s, v];
	}

	hsv2rgb(hsv: number[]) {
		let h = hsv[0];
		let s = hsv[1];
		let v = hsv[2];
		let r, g, b, i, f, p, q, t;
		i = Math.floor(h * 6);
		f = h * 6 - i;
		p = v * (1 - s);
		q = v * (1 - f * s);
		t = v * (1 - (1 - f) * s);
		switch (i % 6) {
			case 0:
				r = v;
				g = t;
				b = p;
				break;
			case 1:
				r = q;
				g = v;
				b = p;
				break;
			case 2:
				r = p;
				g = v;
				b = t;
				break;
			case 3:
				r = p;
				g = q;
				b = v;
				break;
			case 4:
				r = t;
				g = p;
				b = v;
				break;
			case 5:
				r = v;
				g = p;
				b = q;
				break;
		}
		return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
	}

	component2hex(c) {
		const hex = c.toString(16);
		return hex.length == 1 ? "0" + hex : hex;
	}

	rgb2hex(rgb: number[]) {
		return "#" + this.component2hex(rgb[0]) + this.component2hex(rgb[1]) + this.component2hex(rgb[2]);
	}

	hex2rgb(hex) {
		const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return result ? [
			parseInt(result[1], 16),
			parseInt(result[2], 16),
			parseInt(result[3], 16)
		] : null;
	}
}
