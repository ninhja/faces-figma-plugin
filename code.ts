// This file holds the main code for plugins. Code in this file has access to
// the *figma document* via the figma global object.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (See https://www.figma.com/plugin-docs/how-plugins-run).

// Detects whether a given Figma node is a shape that can be filled with an image, color or gradient.
const isShape = (node) =>
  ["RECTANGLE", "ELLIPSE", "STAR", "POLYGON", "VECTOR"].indexOf(node.type) !==
  -1;

// get the list of shapes that the user has selected in Figma
const getSelectedShapes = () => {
  const selectedNodes = figma.currentPage.selection;
  return selectedNodes.filter(isShape);
};

// This shows the HTML page in "ui.html".
// We can also specify the width, height and title of the plugin window, among other options
figma.showUI(__html__, { width: 220, height: 316, title: "UI Faces Demo" });

// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
figma.ui.onmessage = (msg) => {
  // One way of distinguishing between different types of messages sent from
  // your HTML page is to use an object with a "type" property like this.
  if (msg.type === "apply-avatar") {
    const shapes = getSelectedShapes();
    if (shapes.length === 0) {
      figma.notify(
        "Please select a shape to fill, such as a Rectangle, Ellipse, Polygon, Star or Vector!"
      );
    } else if (!msg.imageSrc) {
      figma.notify(
        "Please select an avatar first, or apply a random avatar instead!"
      );
    } else {
      // Display a loading message, and save it in a variable so that we can
      // remove it once the avatar images are successfully applied.
      const loadingMessage = figma.notify("Applying avatar...");

      // Get the avatar image from its Unsplash URL
      figma
        .createImageAsync(msg.imageSrc)
        .then(async (image: Image) => {
          // Create the fill that we'll apply to the shape
          const imageFills = [
            {
              type: "IMAGE",
              imageHash: image.hash,
              scaleMode: "FILL",
            },
          ];

          // Fill each selected shape with the avatar image
          shapes.forEach((shape) => {
            shape.fills = imageFills;
          });

          // remove the loading message once the images have fully loaded
          loadingMessage.cancel();
        })
        .catch((error: any) => {
          console.log(error);
        });
    }
  }
};
