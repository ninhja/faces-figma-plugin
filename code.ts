// This file holds the main code for plugins. Code in this file has access to
// the *figma document* via the figma global object.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (See https://www.figma.com/plugin-docs/how-plugins-run).

// const images = [
//   { src: "https://source.unsplash.com/d0peGya6R5Y/w=400" },
//   { src: "https://source.unsplash.com/d1UPkiFd04A/w=400" },
//   { src: "https://source.unsplash.com/3TLl_97HNJo/w=400" },
//   { src: "https://source.unsplash.com/LaK153ghdig/w=400" },
//   { src: "https://source.unsplash.com/_cvwXhGqG-o/w=400" },
// ];

// This shows the HTML page in "ui.html".
figma.showUI(__html__);

// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
figma.ui.onmessage = (msg) => {
  // One way of distinguishing between different types of messages sent from
  // your HTML page is to use an object with a "type" property like this.
  if (msg.type === "insert-avatar") {
    const currentlySelected = figma.currentPage.selection;
    if (currentlySelected.length === 0) {
      figma.notify(
        "You should select a shape first, such as a Rectangle, Ellipse, Polygon, Star or custom Vector shape!"
      );
    } else {
      function isFillableShape(node) {
        return (
          ["RECTANGLE", "ELLIPSE", "STAR", "POLYGON", "VECTOR"].indexOf(
            node.type
          ) !== -1
        );
      }

      const fillableShapes = currentlySelected.filter(isFillableShape);

      if (fillableShapes.length === 0) {
        figma.notify(
          "You should select a shape first, such as a Rectangle, Ellipse, Polygon, Star or custom Vector shape!"
        );
      }

      const temporaryFills = [{ type: "SOLID", color: { r: 1, g: 0.5, b: 0 } }];
      fillableShapes.forEach((shape) => {
        shape.fills = temporaryFills;
      });

      // Get an image from a URL.
      figma
        .createImageAsync(msg.selectedAvatarSrc)
        .then(async (image: Image) => {
          // Render the image by filling the shapes.
          const imageFills = [
            {
              type: "IMAGE",
              imageHash: image.hash,
              scaleMode: "FILL",
            },
          ];

          // Fill each shape with the image.
          fillableShapes.forEach((shape) => {
            shape.fills = imageFills;
          });
        })
        .catch((error: any) => {
          console.log(error);
        });
    }
  }
};
