import { AddCircle, Delete, Edit } from "@mui/icons-material";
import {
  Button,
  Grid,
  IconButton,
  MenuItem,
  Switch,
  TextField,
} from "@mui/material";
import { useFormik } from "formik";
import React, { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import * as yup from "yup";
import { useGetBrandsQuery } from "../../api/brands";
import { useGetCategoriesQuery } from "../../api/categories";
import { multiFiles } from "../../api/files";
import {
  useAddProductMutation,
  useDeleteProductMutation,
  useEditProductMutation,
  useGetProductsQuery,
} from "../../api/products";
import { useGetSubCategoriesQuery } from "../../api/subcategories";
import MuiCard from "../../components/Card";
import FormBuilder from "../../components/FormBuilder";
import ModalFull from "../../components/ModalFull";
import Title from "../../components/Title";

const Products = () => {
  const { data = [], isLoading } = useGetProductsQuery();
  const { data: categories = [] } = useGetCategoriesQuery();
  const { data: subCategories = [] } = useGetSubCategoriesQuery();
  const { data: brands = [] } = useGetBrandsQuery();
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [add] = useAddProductMutation();
  const [edit] = useEditProductMutation();
  const [del] = useDeleteProductMutation();
  const [img, setImg] = useState("");
  const [value, setValue] = useState("");
  const [properties, setProperties] = useState([]);
  const [editProperties, setEditProperties] = useState([]);
  const [submitDisable, setSubmitDisable] = useState(true);
  const formik = useFormik({
    initialValues: {
      name: "",
      categoryId: "",
      subCategoryId: "",
      brandId: "",
      price: "",
      discount: "",
      hasDiscount: false,
      isNew: false,
    },
    validationSchema: yup.object({
      name: yup
        .string("Enter category name")
        .min(3, "Name should be of minimum 3 characters length")
        .required("Name is required"),
    }),
    onSubmit: async (values) => {
      let product = { ...values };
      if (img.length === 0) return alert("Please select img");
      product.description = value;
      product.properties = properties;
      let formData = new FormData();

      for (let f of img) {
        formData.append("files", f);
      }
      const data = await multiFiles(formData);
      let arr = [];
      for (let img of data.img) {
        let obj = {
          type: img.mimetype,
          src: img.path,
        };
        arr.push(obj);
      }

      product.media = arr;
      add(product);
      setAddModal(false);
    },
  });

  const formik_update = useFormik({
    initialValues: {
      id: null,
      name: "",
      categoryId: "",
      subCategoryId: "",
      brandId: "",
      price: "",
      discount: "",
      hasDiscount: false,
      isNew: false,
    },
    validationSchema: yup.object({
      name: yup
        .string("Enter category name")
        .min(3, "Name should be of minimum 3 characters length")
        .required("Name is required"),
    }),
    onSubmit: async (values) => {
      let product = { ...values };

      product.description = value;
      product.properties = editProperties;
      if (img) {
        let formData = new FormData();

        for (let f of img) {
          formData.append("files", f);
        }
        const data = await multiFiles(formData);
        let arr = [];
        for (let img of data.img) {
          let obj = {
            type: img.mimetype,
            src: img.path,
          };
          arr.push(obj);
        }

        product.media = arr;
      }
      edit(product);
      setEditModal(false);
    },
  });

  return (
    <div>
      <Title>Categories</Title>
      <Grid container spacing={2} direction="row">
        {data.length > 0 &&
          data.map((category) => {
            return (
              <Grid key={category.id} item xs={12} sm={6} md={4} lg={3}>
                <MuiCard name={category.name} img={category.media[0]?.src}>
                  <IconButton
                    color="secondary"
                    onClick={() => {
                      formik_update.setFieldValue("id", category.id);
                      formik_update.setFieldValue("name", category.name);
                      formik_update.setFieldValue(
                        "categoryId",
                        category.categoryId
                      );
                      formik_update.setFieldValue(
                        "subCategoryId",
                        category.subCategoryId
                      );
                      formik_update.setFieldValue("brandId", category.brandId);
                      setValue(category.description);
                      setEditProperties([...category.properties]);
                      setEditModal(true);
                    }}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => {
                      del(category.id);
                    }}
                  >
                    <Delete />
                  </IconButton>
                </MuiCard>
              </Grid>
            );
          })}
        <Grid item alignSelf="flex-end">
          <IconButton
            color="primary"
            onClick={() => {
              setAddModal(true);
              setValue("");
              setProperties([]);
              setImg("");
              formik.resetForm();
            }}
          >
            <AddCircle fontSize="large" />
          </IconButton>
        </Grid>
      </Grid>
      <ModalFull
        open={addModal}
        handleClose={() => setAddModal(false)}
        title="Add Product"
      >
        <form onSubmit={formik.handleSubmit}>
          <Grid container sx={{ p: 10 }} spacing={2}>
            <Grid item>
              <TextField
                id="name"
                name="name"
                label="Name"
                value={formik.values.name}
                onChange={formik.handleChange}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
              />
            </Grid>
            <Grid item>
              <TextField
                sx={{ mb: 2, minWidth: 212 }}
                className="px-2 my-2"
                variant="outlined"
                name="categoryId"
                id="category"
                select
                label="Category"
                value={formik.values.categoryId}
                onChange={formik.handleChange}
                error={
                  formik.touched.categoryId && Boolean(formik.errors.categoryId)
                }
                helperText={
                  formik.touched.categoryId && formik.errors.categoryId
                }
              >
                <MenuItem key={""} value={""}>
                  Choose category
                </MenuItem>
                {categories.length > 0 &&
                  categories.map((option) => (
                    <MenuItem key={option.id} value={option.id}>
                      {option.name}
                    </MenuItem>
                  ))}
              </TextField>
            </Grid>
            <Grid item>
              <TextField
                sx={{ mb: 2, minWidth: 212 }}
                className="px-2 my-2"
                variant="outlined"
                name="subCategoryId"
                id="subCategoryId"
                select
                label="Sub Category"
                value={formik.values.subCategoryId}
                onChange={formik.handleChange}
                error={
                  formik.touched.subCategoryId &&
                  Boolean(formik.errors.subCategoryId)
                }
                helperText={
                  formik.touched.subCategoryId && formik.errors.subCategoryId
                }
              >
                <MenuItem key={""} value={""}>
                  Choose sub category
                </MenuItem>
                {subCategories.length > 0 &&
                  subCategories.map((option) => (
                    <MenuItem key={option.id} value={option.id}>
                      {option.name}
                    </MenuItem>
                  ))}
              </TextField>
            </Grid>
            <Grid item>
              <TextField
                sx={{ mb: 2, minWidth: 212 }}
                className="px-2 my-2"
                variant="outlined"
                name="brandId"
                id="brandId"
                select
                label="Brand"
                value={formik.values.brandId}
                onChange={formik.handleChange}
                error={formik.touched.brandId && Boolean(formik.errors.brandId)}
                helperText={formik.touched.brandId && formik.errors.brandId}
              >
                <MenuItem key={""} value={""}>
                  Choose brand
                </MenuItem>
                {brands.length > 0 &&
                  brands.map((option) => (
                    <MenuItem key={option.id} value={option.id}>
                      {option.name}
                    </MenuItem>
                  ))}
              </TextField>
            </Grid>
            <Grid item>
              <TextField
                id="price"
                name="price"
                label="Price"
                value={formik.values.price}
                onChange={formik.handleChange}
                error={formik.touched.price && Boolean(formik.errors.price)}
                helperText={formik.touched.price && formik.errors.price}
              />
            </Grid>
            <Grid item flexDirection="column">
              <span>Has Discount</span>
              <Switch
                id="hasDiscount"
                name="hasDiscount"
                value={formik.values.hasDiscount}
                onChange={formik.handleChange}
                error={
                  formik.touched.hasDiscount &&
                  Boolean(formik.errors.hasDiscount)
                }
                helperText={
                  formik.touched.hasDiscount && formik.errors.hasDiscount
                }
              />
            </Grid>
            {formik.values.hasDiscount ? (
              <Grid item>
                <TextField
                  id="discount"
                  name="discount"
                  label="discount"
                  value={formik.values.discount}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.discount && Boolean(formik.errors.discount)
                  }
                  helperText={formik.touched.discount && formik.errors.discount}
                />
              </Grid>
            ) : null}
            <Grid xs={12} sx={{ p: 2 }}>
              <ReactQuill theme="snow" value={value} onChange={setValue} />
            </Grid>
            <Grid item xs={12}>
              <div style={{ display: "flex", gap: 5 }}>
                {properties.map((elem) => {
                  return (
                    <div
                      key={elem.id}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 5,
                      }}
                    >
                      <div style={{ display: "flex", gap: 5 }}>
                        <TextField
                          value={elem.name}
                          onChange={(e) => {
                            const copy = [
                              ...properties.map((item) => {
                                if (item.id === elem.id) {
                                  item.name = e.target.value;
                                }
                                return item;
                              }),
                            ];
                            setProperties(copy);
                          }}
                        />
                        <IconButton
                          color="error"
                          onClick={() => {
                            const copy = [
                              ...properties.filter(
                                (item) => item.id !== elem.id
                              ),
                            ];
                            setProperties(copy);
                          }}
                        >
                          <Delete />
                        </IconButton>
                      </div>
                      <FormBuilder
                        key={elem.id}
                        fieldChange={(values) => {
                          setProperties((prev) => [
                            ...prev.map((item) => {
                              if (item.id === elem.id) {
                                item.properties = values;
                              }
                              return item;
                            }),
                          ]);
                        }}
                      />
                    </div>
                  );
                })}
              </div>
              <Button
                variant="contained"
                startIcon={<AddCircle />}
                onClick={() => {
                  let obj = {
                    id: new Date().getTime(),
                    name: "",
                    properties: [],
                  };
                  const copy = [...properties, obj];
                  setProperties(copy);
                }}
              >
                Add field
              </Button>
            </Grid>
            <Grid item>
              <input
                type="file"
                name="img"
                multiple
                onChange={(event) => {
                  setImg(event.target.files);
                }}
              />
            </Grid>
            <Grid xs={12} item sx={{ textAlign: "right" }}>
              <Button
                color="primary"
                variant="contained"
                sx={{ mt: 3, mr: 3 }}
                type="submit"
              >
                Submit
              </Button>
            </Grid>
          </Grid>
        </form>
      </ModalFull>
      <ModalFull
        open={editModal}
        handleClose={() => setEditModal(false)}
        title="Edit Product"
      >
        <form onSubmit={formik_update.handleSubmit}>
          <Grid container sx={{ p: 10 }} spacing={2}>
            <Grid item>
              <TextField
                id="name"
                name="name"
                label="Name"
                value={formik_update.values.name}
                onChange={formik_update.handleChange}
                error={
                  formik_update.touched.name &&
                  Boolean(formik_update.errors.name)
                }
                helperText={
                  formik_update.touched.name && formik_update.errors.name
                }
              />
            </Grid>
            <Grid item>
              <TextField
                sx={{ mb: 2, minWidth: 212 }}
                className="px-2 my-2"
                variant="outlined"
                name="categoryId"
                id="category"
                select
                label="Category"
                value={formik_update.values.categoryId}
                onChange={formik_update.handleChange}
                error={
                  formik_update.touched.categoryId &&
                  Boolean(formik_update.errors.categoryId)
                }
                helperText={
                  formik_update.touched.categoryId &&
                  formik_update.errors.categoryId
                }
              >
                <MenuItem key={""} value={""}>
                  Choose category
                </MenuItem>
                {categories.length > 0 &&
                  categories.map((option) => (
                    <MenuItem key={option.id} value={option.id}>
                      {option.name}
                    </MenuItem>
                  ))}
              </TextField>
            </Grid>
            <Grid item>
              <TextField
                sx={{ mb: 2, minWidth: 212 }}
                className="px-2 my-2"
                variant="outlined"
                name="subCategoryId"
                id="subCategoryId"
                select
                label="Sub Category"
                value={formik_update.values.subCategoryId}
                onChange={formik_update.handleChange}
                error={
                  formik_update.touched.subCategoryId &&
                  Boolean(formik_update.errors.subCategoryId)
                }
                helperText={
                  formik_update.touched.subCategoryId &&
                  formik_update.errors.subCategoryId
                }
              >
                <MenuItem key={""} value={""}>
                  Choose sub category
                </MenuItem>
                {subCategories.length > 0 &&
                  subCategories.map((option) => (
                    <MenuItem key={option.id} value={option.id}>
                      {option.name}
                    </MenuItem>
                  ))}
              </TextField>
            </Grid>
            <Grid item>
              <TextField
                sx={{ mb: 2, minWidth: 212 }}
                className="px-2 my-2"
                variant="outlined"
                name="brandId"
                id="brandId"
                select
                label="Brand"
                value={formik_update.values.brandId}
                onChange={formik_update.handleChange}
                error={
                  formik_update.touched.brandId &&
                  Boolean(formik_update.errors.brandId)
                }
                helperText={
                  formik_update.touched.brandId && formik_update.errors.brandId
                }
              >
                <MenuItem key={""} value={""}>
                  Choose brand
                </MenuItem>
                {brands.length > 0 &&
                  brands.map((option) => (
                    <MenuItem key={option.id} value={option.id}>
                      {option.name}
                    </MenuItem>
                  ))}
              </TextField>
            </Grid>
            <Grid item>
              <TextField
                id="price"
                name="price"
                label="Price"
                value={formik_update.values.price}
                onChange={formik_update.handleChange}
                error={
                  formik_update.touched.price &&
                  Boolean(formik_update.errors.price)
                }
                helperText={
                  formik_update.touched.price && formik_update.errors.price
                }
              />
            </Grid>
            <Grid xs={12} sx={{ p: 2 }}>
              <ReactQuill theme="snow" value={value} onChange={setValue} />
            </Grid>
            <Grid item xs={12}>
              <div style={{ display: "flex", gap: 5 }}>
                {editProperties.map((elem) => {
                  return (
                    <div
                      key={elem.id}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 5,
                      }}
                    >
                      <div style={{ display: "flex", gap: 5 }}>
                        <TextField
                          value={elem.name}
                          onChange={(e) => {
                            const prop = {
                              ...editProperties.find((el) => el.id === elem.id),
                            };
                            prop.name = e.target.value;
                            const copy = [
                              ...editProperties.map((el) => {
                                if (el.id === prop.id) {
                                  return prop;
                                }
                                return el;
                              }),
                            ];

                            setEditProperties(copy);
                          }}
                        />
                        <IconButton
                          color="error"
                          onClick={() => {
                            const copy = [
                              ...editProperties.filter(
                                (item) => item.id !== elem.id
                              ),
                            ];
                            setEditProperties(copy);
                          }}
                        >
                          <Delete />
                        </IconButton>
                      </div>
                      <FormBuilder
                        setSubmitDisable={setSubmitDisable}
                        key={elem.id}
                        properties={elem.properties}
                        fieldChange={(values) => {
                          const prop = {
                            ...editProperties.find((el) => el.id === elem.id),
                          };
                          prop.properties = values;
                          const copy = [
                            ...editProperties.map((el) => {
                              if (el.id === prop.id) {
                                return prop;
                              }
                              return el;
                            }),
                          ];

                          setEditProperties(copy);
                        }}
                      />
                    </div>
                  );
                })}
              </div>
              <Button
                variant="contained"
                startIcon={<AddCircle />}
                onClick={() => {
                  let obj = {
                    id: new Date().getTime(),
                    name: "",
                    properties: [],
                  };
                  const copy = [...properties, obj];
                  setEditProperties(copy);
                }}
              >
                Add field
              </Button>
            </Grid>
            <Grid item>
              <input
                type="file"
                name="img"
                multiple
                onChange={(event) => {
                  setImg(event.target.files);
                }}
              />
            </Grid>
            <Grid xs={12} item sx={{ textAlign: "right" }}>
              <Button
                color="primary"
                variant="contained"
                sx={{ mt: 3, mr: 3 }}
                type="submit"
                disabled={submitDisable}
              >
                Submit
              </Button>
            </Grid>
          </Grid>
        </form>
      </ModalFull>
    </div>
  );
};

export default Products;
