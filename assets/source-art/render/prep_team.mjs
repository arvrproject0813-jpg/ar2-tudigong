// Needs @gltf-transform/core and @gltf-transform/extensions (npm i @gltf-transform/cli). Run from a folder where they are installed.
// Fit a team model for the app: turn its front to +Z, stand it on y = 0, centre it, scale it to `size` metres.
// node prep_team.mjs in.glb out.glb <rotYdeg> <size> [axis: xz|y|max]
import { NodeIO, getBounds } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer';     // (installed with @gltf-transform/cli) so meshopt-compressed models can be read too
const [,, inp, out, rotDeg = '0', sizeStr = '0.4', axis = 'xz'] = process.argv;
await MeshoptDecoder.ready; await MeshoptEncoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder, 'meshopt.encoder': MeshoptEncoder });
const doc = await io.read(inp);
const scene = doc.getRoot().getDefaultScene() || doc.getRoot().listScenes()[0];
const b = getBounds(scene);
const c = [(b.min[0] + b.max[0]) / 2, b.min[1], (b.min[2] + b.max[2]) / 2];
const ext = [b.max[0] - b.min[0], b.max[1] - b.min[1], b.max[2] - b.min[2]];
const ref = axis === 'y' ? ext[1] : axis === 'max' ? Math.max(...ext) : Math.max(ext[0], ext[2]);
const s = parseFloat(sizeStr) / ref;
const a = (parseFloat(rotDeg) * Math.PI) / 180;
const inner = doc.createNode('model').setTranslation([-c[0], -c[1], -c[2]]);
for (const n of scene.listChildren()) { scene.removeChild(n); inner.addChild(n); }
const outer = doc.createNode('fit').setRotation([0, Math.sin(a / 2), 0, Math.cos(a / 2)]).setScale([s, s, s]).addChild(inner);
scene.addChild(outer);
// tidy: drop the volume extension (only thickness defaults) so every viewer shows the same colours
await io.write(out, doc);
const nb = getBounds(scene);
console.log(out.split('/').pop(), 'size', nb.max.map((v, i) => (v - nb.min[i]).toFixed(3)).join(' x '));
