import {
  CSSProperties,
  FC,
  HTMLProps,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

export type AutoSizeInputProps = HTMLProps<HTMLInputElement> & {
  minWidth?: number;
  minHeight?: number;
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
  ...props
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const measureRef = useRef<HTMLSpanElement | null>(null);
  const [styles, setStyles] = useState<CSSProperties>({});

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

  // measure the text on change and update input
  useEffect(() => {
    if (measureRef.current === null) return;
    if (inputRef.current === null) return;

    // Max width is 600px
    const maxWidth = 600;
    const width = measureRef.current.clientWidth;

    if (width <= maxWidth) {
      inputRef.current.style.width = Math.max(minWidth, width) + "px";
    } else {
      inputRef.current.style.width = `${maxWidth}px`;
    }

    const height = measureRef.current.clientHeight;
    inputRef.current.style.height = Math.max(minHeight, height) + "px";
  }, [props.value, minWidth, styles]);

  return (
    <>
      <input ref={setRef} {...props} value={props.value || ""} />
      <span ref={measureRef} style={{ ...baseStyles, ...styles }}>
        {props.value || ""}
      </span>
    </>
  );
};
