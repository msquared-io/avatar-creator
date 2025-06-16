# Clothes 👕

The `top`, `bottom`, and `shoes` slots are simple slots that contain a UE5 Manny skeleton and a single skinned mesh.

These slots can overlap with the body, so designing and rigging should take body parts into account.

Certain body parts can be hidden. For example, if a hoodie covers the entire torso, only the arms will be rendered. If trousers fully cover the legs, the legs will not be rendered. However, if a T-shirt only partially covers the torso, the entire top will be rendered, and rigging must ensure that during animation, there is no clipping of cloth through the body.

There are two types of a body - BodyA and BodyB️. When designing an asset it should be designed for each one of them separately, as they have a different proportions and skeletons.

# Templates 📄

The templates are body-type specific.  
Here is a list of templates that can be used as a starting point for designing your custom models:

## BodyA

### Top 👕

* [Baseball Jersey Brown](../examples/avatar-preview-app/public/parts/Top_A_BaseballJersey_PlainBrown_01.glb)
  ![Baseball Jersey Brown](../examples/avatar-preview-app/public/parts/Top_A_BaseballJersey_PlainBrown_01.webp)
* [Flannel Shirt Checkered](../examples/avatar-preview-app/public/parts/Top_A_FlannelShirt_CheckerdBW_01.glb)
  ![Flannel Shirt Checkered](../examples/avatar-preview-app/public/parts/Top_A_FlannelShirt_CheckerdBW_01.webp)

### Bottom 👖

* [Cargo Trousers Mid Blue Wash](../examples/avatar-preview-app/public/parts/Bottom_A_CargoTrousers_MidBlueWash_01.glb)
  ![Cargo Trousers Mid Blue Wash](../examples/avatar-preview-app/public/parts/Bottom_A_CargoTrousers_MidBlueWash_01.webp)
* [Joggers Grey](../examples/avatar-preview-app/public/parts/Bottom_A_TightJoggers_GreyTrack_01.glb)
  ![Joggers Grey](../examples/avatar-preview-app/public/parts/Bottom_A_TightJoggers_GreyTrack_01.webp)

### Shoes 👟

* [High Tops Running Black](../examples/avatar-preview-app/public/parts/Shoes_A_HighTops_RunningBlack_01.glb)
  ![High Tops Running Black](../examples/avatar-preview-app/public/parts/Shoes_A_HighTops_RunningBlack_01.webp)

## BodyB

### Top 🥻

* [Baseball Jersey Brown](../examples/avatar-preview-app/public/parts/Top_B_BaseballJersey_PlainBrown_01.glb)
  ![Baseball Jersey Brown](../examples/avatar-preview-app/public/parts/Top_B_BaseballJersey_PlainBrown_01.webp)
* [T-Shirt White](../examples/avatar-preview-app/public/parts/Top_B_AsymHemTshirt_PlainWhite.glb)
  ![T-Shirt White](../examples/avatar-preview-app/public/parts/Top_B_AsymHemTshirt_PlainWhite.webp)

### Bottom 👖

* [Leggings](../examples/avatar-preview-app/public/parts/Bottom_B_Leggings_BB_01.glb)
  ![Leggings](../examples/avatar-preview-app/public/parts/Bottom_B_Leggings_BB_01.webp)
* [Joggers Grey](../examples/avatar-preview-app/public/parts/Bottom_B_TightJoggers_GreyTrack_01.glb)
  ![Joggers Grey](../examples/avatar-preview-app/public/parts/Bottom_B_TightJoggers_GreyTrack_01.webp)

### Shoes 👟

* [High Tops Retro White](../examples/avatar-preview-app/public/parts/Shoes_B_HighTopsRetro_White_01.glb)
  ![High Tops Retro White](../examples/avatar-preview-app/public/parts/Shoes_B_HighTopsRetro_White_01.webp)

## Body Parts for Overlap Checking ⛹️

Here are body parts that can be used to check if a model overlaps:

### BodyA️

* [Torso + Arms](../examples/avatar-preview-app/public/parts/Body_A_TorsoHeadless_01.glb)
* [Arms](../examples/avatar-preview-app/public/parts/Body_A_ArmsHeadless_01.glb)
* [Legs](../examples/avatar-preview-app/public/parts/Body_A_BodyLegs_01.glb)

### BodyB

* [Torso + Arms](../examples/avatar-preview-app/public/parts/Body_B_BodyTorsoHeadless_03.glb)
* [Arms](../examples/avatar-preview-app/public/parts/Body_B_BodyArmsHeadless_03.glb)
* [Legs](../examples/avatar-preview-app/public/parts/Body_B_BodyLegs_03.glb)

When a model is previewed, it should display either Torso + Arms or Arms only. Legs can be shown or hidden separately.


# Textures & Materials 🖼️

Only one PBR material should be used for the entire model.
The resolution must be 1024x1024 with no tiling.
File format: PNG without transparency.

### 🖼️ Albedo

RGB texture that contains color values, without any illumination.

### 🖼️ Ambient Occlusion

Grayscale texture that contains ambient occlusion information.

### 🖼️ Normals

A standard normal map.

### 🖼️ Roughness and Metalness

An RGB texture with Metalness in the blue channel and Roughness in the green channel. The red channel is unused and should be black.

**Metalness**: A grayscale value where 0 means non-metallic and 1 means metallic. Typically, it is either 0 or 1, with intermediate values used rarely.

**Roughness:** A grayscale value where 0 means fully glossy (mirror-like) and 1 means fully rough. Most often, intermediate values are used. Ensure roughness values are reasonable to make the material look appropriately shiny or rough, avoiding an overly "wet" or overly "plain" appearance.

# Conditions ❗

1. Do not modify the skeleton: node names, hierarchy, position, orientation, or scale. The skeleton must remain exactly as provided in the template.
2. Use only one node with a mesh to represent a piece.
3. Use only one material for your mesh.
4. Provide exactly four textures: albedo, normals, roughness + metalness, and ambient occlusion.
5. Texture resolution must be 1024x1024 in PNG format.

# Testing ✔️

Test your models with various combinations of other pieces to ensure they look good together and do not overlap or clip through each other.

1. Verify that your model is a valid GLB file using the official validator: https://github.khronos.org/glTF-Validator/

2. Preview your GLB files here: https://playcanvas.com/model-viewer
