// Copyright (c) 2022. Heusala Group Oy <info@heusalagroup.fi>. All rights reserved.

import { OSAKE_KAUPPA_LASKURI_VIEW_CLASS_NAME } from "../../constants/classNames";
import NumberField from "../../fields/number/NumberField";
import { FormEvent, useCallback, useState } from "react";
import LogService from "../../../fi/nor/ts/LogService";
import "./OsakeKauppaLaskuriView.scss";

const LOG = LogService.createLogger('OsakeKauppaLaskuriView');

function formatNumber (x : number) : string {
    return x.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ").replace(/\./, ",");
}

export interface OsakeKauppaViewProps {
    readonly className ?: string;
}

export function OsakeKauppaLaskuriView (props: OsakeKauppaViewProps) {

    const className = props?.className;

    const currentYear = (new Date()).getFullYear();

    const [ kauppaSumma, setKauppaSumma ] = useState<number|undefined>(1000);
    const [ hankintaHinta, setHankintaHinta ] = useState<number|undefined>(0);

    const kauppaSummaValue   = kauppaSumma ?? 0;
    const hankintaHintaValue = hankintaHinta ?? 0;

    const [ yli10Years , setYli10Years] = useState<boolean>(false);

    const hankintaHintaOlettamaOsuus = yli10Years ? 0.40 : 0.20;

    const hankintaHintaOlettama = (kauppaSumma ?? 0) * hankintaHintaOlettamaOsuus;

    const veroVahennys = hankintaHintaOlettama > hankintaHintaValue ? hankintaHintaOlettama : hankintaHintaValue;

    const verotettavaSumma = kauppaSummaValue >= veroVahennys ? kauppaSummaValue - veroVahennys : 0;

    const yli30k      = verotettavaSumma >= 30000;
    const ali30kSumma = yli30k ? 30000 : verotettavaSumma;
    const yli30kSumma = yli30k ? verotettavaSumma - 30000 : 0;

    const vero30pSumma = ali30kSumma * 0.30;
    const vero34pSumma = yli30kSumma * 0.34;

    const veronSumma = vero30pSumma + vero34pSumma;

    const kauppaSummaNetto = kauppaSummaValue - veronSumma;

    const varainSiirtoVero = kauppaSummaValue * 0.016;

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
                    label={"Kauppahinta"}
                    value={kauppaSumma}
                    setValue={(value) => setKauppaSumma(value)}
                />

                <NumberField
                    label={"Hankintahinta"}
                    value={hankintaHinta}
                    setValue={(value) => setHankintaHinta(value)}
                />

                <label className={"checkbox-field"}>
                    <input
                        type={"checkbox"}
                        checked={yli10Years}
                        onChange={(event) => {setYli10Years(!yli10Years)}}
                    />
                    Olen omistanut osakkeet yli 10 vuotta
                </label>

                <br />
                <br />

                <input type="submit" value="Laske" className={"button"} />

            </form>

            <p>Tämä laskuri on tarkoitettu ainoastaan luonnollisen henkilön tekemiin osakekauppoihin.</p>
            <p>Tarkista laskelma aina ammattilaisella. <strong>Emme ota vastuuta laskelman tuloksista!</strong></p>

            <article className={OSAKE_KAUPPA_LASKURI_VIEW_CLASS_NAME+'-results'}>

                <h3>Myyjän osuus</h3>

                <div className={"row"}><div className={"label"}>Kauppahinta</div><div className={"value"}>{formatNumber(kauppaSummaValue)} €</div></div>
                <div className={"row"}><div className={"label"}>Hankintameno-olettama</div><div className={"value"}>{formatNumber(hankintaHintaOlettama)} € ({hankintaHintaOlettamaOsuus*100} %)</div></div>
                <div className={"row"}><div className={"label"}>Vähennyskelpoinen osuus</div><div className={"value"}>{formatNumber(veroVahennys)} €</div></div>
                <div className={"row"}><div className={"label"}>Verotettava myyntivoitto yhteensä</div><div className={"value"}>{formatNumber(verotettavaSumma)} €</div></div>
                <div className={"row"}><div className={"label"}>Verotettava myyntivoitto (30%)</div><div className={"value"}>{formatNumber(ali30kSumma)} € ({formatNumber(vero30pSumma)} €)</div></div>
                <div className={"row"}><div className={"label"}>Verotettava myyntivoitto (34%)</div><div className={"value"}>{formatNumber(yli30kSumma)} € ({formatNumber(vero34pSumma)} €)</div></div>
                <div className={"row"}><div className={"label"}>Veron määrä yhteensä</div><div className={"value"}>{formatNumber(veronSumma)} €</div></div>
                <div className={"row"}><div className={"label"}>Kauppahinta (netto)</div><div className={"value"}>{formatNumber(kauppaSummaNetto)} €</div></div>

                <p>Hankintameno-olettama on 40%, jos olet omistanut osakkeet yli 10 vuotta. Tarkista tarkka omistusaika!</p>

                <h3>Ostajan osuus</h3>

                <div className={"row"}><div className={"label"}>Varainsiirtovero</div><div className={"value"}>{formatNumber(varainSiirtoVero)} € (1.6 %)</div></div>

            </article>

            <footer>
                &copy; 2022 <a href={"https://heusalagroup.fi"}>Heusala Group Oy</a>
                &nbsp;| Lähdekoodi: <a href={"https://github.com/hangovergames/laskurit"}>Github</a>
            </footer>

        </div>
    );

}

export default OsakeKauppaLaskuriView;
