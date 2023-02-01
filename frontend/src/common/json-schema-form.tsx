import Form from "@rjsf/core";

export const JsonForm = (props: any) => {
  const {
    formData, setFormData, jsonSchema, uiSchema, setValidationError = () => {
    }
  } = props;

  const handleFormChange = (values: any) => {
    setFormData(values.formData);
    setValidationError(values.schemaValidationErrors.length > 0);
  };

  return (
    <Form
      liveValidate
      formData={formData}
      schema={jsonSchema ?? {}}
      uiSchema={uiSchema ?? {}}
      onChange={handleFormChange}
      onError={(err) => console.log("error", err)}
      children={true} //hide submit button
      showErrorList={false}
    />
  );
};
