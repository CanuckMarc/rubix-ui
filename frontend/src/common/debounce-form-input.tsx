import { Form, Input } from "antd";
import { Rule } from "antd/lib/form";
import debounce from "debounce-promise";
import { useState } from "react";

const { Search } = Input;

export interface DebounceInputFormProps {
    name: string;
    placeholder?: string;
    label?: string;
    rules?: Rule[];
    onCall: (input: string) => Promise<DebounceInputResponse>;
}

export interface DebounceInputResponse {
    error?: string,
    success: boolean,
}


const onValidateUrl = debounce((url: string, onCall: (input: string) => Promise<DebounceInputResponse>) => {
    return onCall(url);
}, 500);

enum ValidateStatus {
    error = "error", validating = "validating", success = "success", initial = "initial"
}

export const DebounceInputForm = (props: DebounceInputFormProps) => {

    const [validateStatus, setValidateStatus] = useState(ValidateStatus.initial);
    const required = props.rules?.find((rule) => {
        // @ts-ignore
        return rule.required;
    })

    return <Form.Item
        name={props.name}
        label={props.label}
        hasFeedback
        // @ts-ignore
        validateStatus={validateStatus != ValidateStatus.initial ? validateStatus.toString() : undefined}
        rules={[
            ...(props.rules ?? []),
            () => ({
                validator(_, value) {
                    setValidateStatus(ValidateStatus.validating)
                    // @ts-ignore
                    if (required?.required && !value) {
                        setValidateStatus(ValidateStatus.error)
                        return Promise.resolve()
                    } else {
                        return new Promise((resolve, reject) => {
                            onValidateUrl(value, props.onCall).then(
                                (response: any) => {
                                    if (response) {
                                        setValidateStatus(ValidateStatus.success)
                                        resolve(true);
                                    } else {
                                        setValidateStatus(ValidateStatus.error)
                                        reject("Invlaid url.");
                                    }
                                }
                            );
                        });
                    };
                }
            })
        ]}
    >
        <Input
            placeholder={props.placeholder}
        />
    </Form.Item>;
}