// Copyright (c) 2022. Heusala Group Oy <info@heusalagroup.fi>. All rights reserved.

import { OSAKE_KAUPPA_LASKURI_VIEW_CLASS_NAME } from "../../constants/classNames";
import NumberField from "../../fields/number/NumberField";
import { FormEvent, useCallback, useState } from "react";
import LogService from "../../../fi/nor/ts/LogService";
import "./OsakeKauppaLaskuriView.scss";

const LOG = LogService.createLogger('OsakeKauppaLaskuriView');

function formatNumber (x : number) : string {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export interface OsakeKauppaViewProps {
    readonly className ?: string;
}

export function OsakeKauppaLaskuriView (props: OsakeKauppaViewProps) {

    const className = props?.className;

    const [ kauppaSumma, setKauppaSumma ] = useState<number|undefined>(1000);
    const [ hankintaHinta, setHankintaHinta ] = useState<number|undefined>(0);

    const kauppaSummaValue = kauppaSumma ?? 0;
    const hankintaHintaValue = hankintaHinta ?? 0;

    const hankintaHintaOlettama = (kauppaSumma ?? 0) * 0.20;

    const veroVahennys = hankintaHintaOlettama > hankintaHintaValue ? hankintaHintaOlettama : hankintaHintaValue;

    const verotettavaSumma = kauppaSummaValue >= veroVahennys ? kauppaSummaValue - veroVahennys : 0;

    const yli30k      = verotettavaSumma >= 30000;
    const ali30kSumma = yli30k ? 30000 : verotettavaSumma;
    const yli30kSumma = yli30k ? verotettavaSumma - 30000 : 0;

    const vero30pSumma = ali30kSumma * 0.30;
    const vero34pSumma = yli30kSumma * 0.34;

    const veronSumma = vero30pSumma + vero34pSumma;

    const kauppaSummaNetto = kauppaSummaValue - veronSumma;

    const handleSubmit = useCallback(
        (event : FormEvent<HTMLFormElement>) => {

            if (event) {
                event.preventDefault();
                event.stopPropagation();
            }

            LOG.debug(`submit: `, kauppaSumma);

        },
        [
            kauppaSumma
        ]
    );

    return (
        <div className={
            OSAKE_KAUPPA_LASKURI_VIEW_CLASS_NAME
            + (className? ` ${className}` : '')
        }>

            <h3>Osakekauppalaskuri</h3>

            <form onSubmit={handleSubmit}>

                <NumberField
                    label={"Osakekaupan hinta"}
                    value={kauppaSumma}
                    setValue={(value) => setKauppaSumma(value)}
                />

                <NumberField
                    label={"Hankintahinta"}
                    value={hankintaHinta}
                    setValue={(value) => setHankintaHinta(value)}
                />

                <br />
                <br />

                <input type="submit" value="Laske" className={"button"} />

            </form>

            <article className={OSAKE_KAUPPA_LASKURI_VIEW_CLASS_NAME+'-results'}>

                <div className={"row"}><div className={"label"}>Kauppahinta</div><div className={"value"}>{formatNumber(kauppaSummaValue)} €</div></div>
                <div className={"row"}><div className={"label"}>Hankintameno-olettama</div><div className={"value"}>{formatNumber(hankintaHintaOlettama)} €</div></div>
                <div className={"row"}><div className={"label"}>Vähennyskelpoinen osuus</div><div className={"value"}>{formatNumber(veroVahennys)} €</div></div>
                <div className={"row"}><div className={"label"}>Verotettava myyntivoitto yhteensä</div><div className={"value"}>{formatNumber(verotettavaSumma)} €</div></div>
                <div className={"row"}><div className={"label"}>Verotettava myyntivoitto (30%)</div><div className={"value"}>{formatNumber(ali30kSumma)} € ({formatNumber(vero30pSumma)} €)</div></div>
                <div className={"row"}><div className={"label"}>Verotettava myyntivoitto (34%)</div><div className={"value"}>{formatNumber(yli30kSumma)} € ({formatNumber(vero34pSumma)} €)</div></div>
                <div className={"row"}><div className={"label"}>Veron määrä yhteensä</div><div className={"value"}>{formatNumber(veronSumma)} €</div></div>
                <div className={"row"}><div className={"label"}>Kauppahinta (netto)</div><div className={"value"}>{formatNumber(kauppaSummaNetto)} €</div></div>

            </article>

        </div>
    );

}

export default OsakeKauppaLaskuriView;
