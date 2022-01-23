// Copyright (c) 2022. Heusala Group Oy <info@heusalagroup.fi>. All rights reserved.

import { NUMBER_FIELD_CLASS_NAME } from "../../constants/classNames";
import { useCallback, ChangeEvent, useState, useEffect } from "react";
import { isNumber, isSafeInteger, trim } from "../../../fi/nor/ts/modules/lodash";
import LogService from "../../../fi/nor/ts/LogService";
import "./NumberField.scss";
import StringUtils from "../../../fi/nor/ts/StringUtils";

const LOG = LogService.createLogger('NumberField');

function formatNumber (x : number) {
    return StringUtils.formatNumber(x, ' ', ',');
}

export interface NumberFieldProps {
    readonly className ?: string;
    readonly label     ?: string;
    readonly value     ?: number;
    readonly setValue  ?: (value: number | undefined) => void;
}


function parseTextValue (value: string | undefined) : number | undefined {

    if (value === undefined) return undefined;

    const textValue = trim(`${value ?? ''}`).replace(/\s+/g, "");
    if (!textValue) return undefined;

    const dotIndex = textValue.indexOf('.');
    const hasDot = dotIndex >= 0;
    const commaIndex = textValue.indexOf(',');
    const hasComma = commaIndex >= 0;

    if ( hasDot && hasComma ) {
        return undefined;
    }

    if ( hasDot || hasComma ) {
        const index = hasDot ? dotIndex : commaIndex;
        const firstPart = parseInt(trim(textValue.substring(0, index)), 10);
        const secondPart = trim(textValue.substring(index + 1));
        const parsedFloatValue = parseFloat(firstPart + '.' + secondPart);
        if ( !isNaN(parsedFloatValue) && isNumber(parsedFloatValue)) {
            return parsedFloatValue;
        }
        return undefined;
    }

    const parsedIntValue = parseInt(textValue, 10);
    if (isSafeInteger(parsedIntValue)) return parsedIntValue;
    return undefined;

}

export function NumberField (props: NumberFieldProps) {

    const className = props?.className;
    const label     = props?.label;
    const value     = props?.value;
    const setValue  = props?.setValue;

    const [hasFocus, setFocus] = useState<boolean>(false);
    const [isValid, setValidity] = useState<boolean>(value !== undefined);
    const [textValue, setTextValue] = useState<string>(value !== undefined ? formatNumber(value) : '');

    const onChangeCallback = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {

            const textValue = event?.target?.value ?? '';

            setTextValue(textValue);

            const newValue = parseTextValue(textValue);

            if (setValue) {
                LOG.debug(`onChangeCallback: `, textValue, newValue);
                setValidity(newValue !== undefined);
                setValue(newValue);
            } else {
                LOG.debug(`onChangeCallback: No setValue for change: `, textValue, newValue);
                setValidity(false);
            }

        },
        [
            setValue
        ]
    );

    useEffect( () => {
        const newText = value !== undefined ? formatNumber(value) : '';
        if (
            !hasFocus && newText !== textValue
        ) {
            setTextValue( newText );
        }
    }, [
        value,
        hasFocus,
        textValue,
        setTextValue
    ]);

    return (
        <label className={
            NUMBER_FIELD_CLASS_NAME
            + (className? ` ${className}` : '')
            + ' ' + (isValid ? NUMBER_FIELD_CLASS_NAME+'-is-valid' :  NUMBER_FIELD_CLASS_NAME+'-is-invalid')
        }>

            <div className={NUMBER_FIELD_CLASS_NAME+"-label-container"}>
                {label ? <div className={NUMBER_FIELD_CLASS_NAME+"-label"}>{label}</div> : null }
            </div>

            <div className={NUMBER_FIELD_CLASS_NAME+"-input-container"}>

                <input
                    type="text"
                    value={textValue}
                    onFocus={() => setFocus(true)}
                    onBlur={() => setFocus(false)}
                    onChange={onChangeCallback}
                />

            </div>
        </label>
    );

}

export default NumberField;
