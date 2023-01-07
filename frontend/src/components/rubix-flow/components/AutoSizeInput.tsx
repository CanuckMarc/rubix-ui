import { ChangeEvent, CSSProperties, FC, HTMLProps, useCallback, useEffect, useRef, useState } from "react";

export const MAX_WIDTH_INPUT = 300;
export type AutoSizeInputProps = HTMLProps<HTMLInputElement> & {
  minWidth?: number;
  minHeight?: number;
  onChangeInput?: (value: any) => void;
};

const baseStyles: CSSProperties = {
  position: "absolute",
  top: 0,
  left: 0,
  visibility: "hidden",
  height: 0,
  width: "auto",
  whiteSpace: "pre",
};

export const AutoSizeInput: FC<AutoSizeInputProps> = ({
  minWidth = 40,
  minHeight = 30,
  onChangeInput = () => {},
  ...props
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const measureRef = useRef<HTMLSpanElement | null>(null);
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
  const [styles, setStyles] = useState<CSSProperties>({});
  const [isShowArea, setIsShowArea] = useState<boolean>(false);
  const [textArea, setTextArea] = useState<string | number | readonly string[] | undefined>(props.value);

  // grab the font size of the input on ref mount
  const setRef = useCallback((input: HTMLInputElement | null) => {
    if (input) {
      const styles = window.getComputedStyle(input);
      setStyles({
        fontSize: styles.getPropertyValue("font-size"),
        paddingLeft: styles.getPropertyValue("padding-left"),
        paddingRight: styles.getPropertyValue("padding-right"),
      });
    }
    inputRef.current = input;
  }, []);

  const setTextAreaRef = useCallback((input: HTMLTextAreaElement | null) => {
    textAreaRef.current = input;
  }, []);

  const handleChangeTextArea = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setTextArea(e.target.value);
  };

  const handleBlurTextArea = () => onChangeInput(textArea);

  const handleToggleTextArea = () => {
    if (measureRef.current && measureRef.current.clientWidth > MAX_WIDTH_INPUT) {
      setIsShowArea((p) => !p);
    }
  };

  // measure the text on change and update input
  useEffect(() => {
    if (measureRef.current === null) return;
    if (inputRef.current === null) return;

    const width = measureRef.current.clientWidth;
    if (width <= MAX_WIDTH_INPUT) {
      inputRef.current.style.width = Math.max(minWidth, width) + "px";
    } else {
      inputRef.current.style.width = `${MAX_WIDTH_INPUT}px`;
    }

    // const height = measureRef.current.clientHeight;
    // inputRef.current.style.height = Math.max(minHeight, height) + "px";
  }, [props.value, minWidth, styles]);

  useEffect(() => {
    setTextArea(props.value);
  }, [props.value]);

  return (
    <>
      {isShowArea ? (
        <textarea
          ref={setTextAreaRef}
          className={props.className}
          disabled={props.disabled}
          value={textArea || ""}
          rows={5}
          onChange={handleChangeTextArea}
          onBlur={handleBlurTextArea}
          onMouseOut={handleToggleTextArea}
          style={{
            width: MAX_WIDTH_INPUT,
          }}
        />
      ) : (
        <input
          ref={setRef}
          onChange={(e) => onChangeInput(e.currentTarget.value)}
          onMouseOver={handleToggleTextArea}
          {...props}
          value={props.value || ""}
        />
      )}
      <span ref={measureRef} style={{ ...baseStyles, ...styles }}>
        {props.value || ""}
      </span>
    </>
  );
};
