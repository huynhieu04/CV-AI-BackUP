const GRADIENT = "Gradient";

const paintable = TBase => (
    class extends TBase {
        fill(color, opacity) {
            const options = this.options;

            if (color !== undefined) {
                if (color && color.nodeType !== GRADIENT) {
                    const newFill = {
                        color: color
                    };
                    if (opacity !== undefined) {
                        newFill.opacity = opacity;
                    }
                    options.set("fill", newFill);
                } else {
                    options.set("fill", color);
                }

                return this;
            }

            return options.get("fill");
        }

        stroke(color, width, opacity) {
            if (color !== undefined) {
                this.options.set("stroke.color", color);

                if (width !== undefined) {
                    this.options.set("stroke.width", width);
                }

                if (opacity !== undefined) {
                    this.options.set("stroke.opacity", opacity);
                }

                return this;
            }

            return this.options.get("stroke");
        }
    }
);

export default paintable;
