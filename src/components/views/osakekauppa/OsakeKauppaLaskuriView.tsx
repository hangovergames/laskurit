// Copyright (c) 2022. Heusala Group Oy <info@heusalagroup.fi>. All rights reserved.

import { OSAKE_KAUPPA_LASKURI_VIEW_CLASS_NAME } from "../../constants/classNames";
import NumberField from "../../fields/number/NumberField";
import { FormEvent, useCallback, useState } from "react";
import LogService from "../../../fi/nor/ts/LogService";
import "./OsakeKauppaLaskuriView.scss";
import FiStockTradeTaxCalculator from "../../../fi/nor/ts/laskurit/FiStockTradeTaxCalculator";
import StringUtils from "../../../fi/nor/ts/StringUtils";

const LOG = LogService.createLogger('OsakeKauppaLaskuriView');

function formatNumber (x : number) {
    return StringUtils.formatNumber(x, ' ', ',');
}

export interface OsakeKauppaViewProps {
    readonly className ?: string;
}

export function OsakeKauppaLaskuriView (props: OsakeKauppaViewProps) {

    const className = props?.className;

    const [ kauppaSumma, setKauppaSumma ] = useState<number|undefined>(1000);
    const [ valitysPalkkio, setValitysPalkkio ] = useState<number|undefined>(undefined);
    const [ hankintaHinta, setHankintaHinta ] = useState<number|undefined>(0);
    const [ hankintaVarainsiirtoVero, setHankintaVarainsiirtoVero ] = useState<number|undefined>(undefined);

    const hankintaHintaValue = hankintaHinta ?? 0;
    const kauppaSummaValue   = kauppaSumma ?? 0;
    const hankintaVarainsiirtoVeroValue   = hankintaVarainsiirtoVero ?? 0;
    const valitysPalkkioValue   = valitysPalkkio ?? 0;

    const [ ostinOsakkeet , setOstinOsakkeet] = useState<boolean>(false);
    const [ yli10Years , setYli10Years] = useState<boolean>(false);

    const result = FiStockTradeTaxCalculator.calculate(
        kauppaSummaValue,
        hankintaHintaValue,
        hankintaVarainsiirtoVeroValue,
        valitysPalkkioValue,
        ostinOsakkeet,
        yli10Years
    );

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

                <label className={"checkbox-field"}>
                    <input
                        type={"checkbox"}
                        checked={yli10Years}
                        onChange={(event) => {setYli10Years(!yli10Years)}}
                    />
                    Olen omistanut osakkeet yli 10 vuotta
                </label>

                <label className={"checkbox-field"}>
                    <input
                        type={"checkbox"}
                        checked={ostinOsakkeet}
                        onChange={(event) => {setOstinOsakkeet(!ostinOsakkeet)}}
                    />
                    Osakkeet on hankittu ostamalla
                </label>

                {ostinOsakkeet? (
                    <>

                        <NumberField
                            label={"Hankintahinta"}
                            value={hankintaHinta}
                            setValue={(value) => setHankintaHinta(value)}
                        />

                        <NumberField
                            label={"Hankinnan varainsiirtovero"}
                            value={hankintaVarainsiirtoVero}
                            setValue={(value) => setHankintaVarainsiirtoVero(value)}
                        />

                        <NumberField
                            label={"Hankinnan välityspalkkio"}
                            value={valitysPalkkio}
                            setValue={(value) => setValitysPalkkio(value)}
                        />

                    </>
                ) : (
                    <>
                        <NumberField
                            label={"Osakepääoma perustaessa"}
                            value={hankintaHinta}
                            setValue={(value) => setHankintaHinta(value)}
                        />
                    </>
                )}

                <NumberField
                    label={"Kauppahinta (brutto)"}
                    value={kauppaSumma}
                    setValue={(value) => setKauppaSumma(value)}
                />

                <NumberField
                    label={"Kauppahinta (netto)"}
                    value={result.kauppaSummaNetto}
                    setValue={(value) => {

                        if (value !== undefined) {

                            const result = FiStockTradeTaxCalculator.reverseCalculate(
                                value,
                                hankintaHintaValue,
                                hankintaVarainsiirtoVeroValue,
                                valitysPalkkioValue,
                                ostinOsakkeet,
                                yli10Years
                            );

                            if (result) {
                                setKauppaSumma(result.kauppaSummaBrutto);
                            }

                        }

                    }}
                />

                <br />
                <br />

                <input type="submit" value="Laske" className={"button"} />

            </form>

            <p><strong>Huomio!</strong> Tämä laskuri on tarkoitettu ainoastaan luonnollisen henkilön tekemiin osakekauppoihin.</p>
            <p>Tarkista laskelma aina ammattilaisella. <strong>Emme vastaa laskelman tuloksista!</strong></p>

            <article className={OSAKE_KAUPPA_LASKURI_VIEW_CLASS_NAME+'-results'}>

                <h3>Myyjän osuus</h3>

                <div className={"row"}><div className={"label"}>Kauppahinta (brutto)</div><div className={"value"}>{formatNumber(result.kauppaSummaBrutto)} €</div></div>
                <div className={"row"}><div className={"label"}>Hankintameno-olettama</div><div className={"value"}>{formatNumber(result.hankintaHintaOlettama)} € ({result.hankintaHintaOlettamaOsuus*100} %)</div></div>
                <div className={"row"}><div className={"label"}>Vähennyskelpoinen osuus</div><div className={"value"}>{formatNumber(result.veroVahennys)} €</div></div>
                <div className={"row"}><div className={"label"}>Verotettava luovutusvoitto yhteensä</div><div className={"value"}>{formatNumber(result.verotettavaSumma)} €</div></div>
                <div className={"row"}><div className={"label"}>Verotettava luovutusvoitto (30%)</div><div className={"value"}>{formatNumber(result.ali30kSumma)} € ({formatNumber(result.vero30pSumma)} €)</div></div>
                <div className={"row"}><div className={"label"}>Verotettava luovutusvoitto (34%)</div><div className={"value"}>{formatNumber(result.yli30kSumma)} € ({formatNumber(result.vero34pSumma)} €)</div></div>
                <div className={"row"}><div className={"label"}>Veron määrä yhteensä</div><div className={"value"}>{formatNumber(result.veronSumma)} €</div></div>
                <div className={"row"}><div className={"label"}>Kauppahinta (netto)</div><div className={"value"}>{formatNumber(result.kauppaSummaNetto)} €</div></div>

                <p>Hankintameno-olettama on 40%, jos olet omistanut osakkeet yli 10 vuotta. Tarkista tarkka omistusaika!</p>

                <h3>Ostajan osuus</h3>

                <div className={"row"}><div className={"label"}>Kauppahinta</div><div className={"value"}>{formatNumber(result.kauppaSummaBrutto)} €</div></div>
                <div className={"row"}><div className={"label"}>Varainsiirtovero</div><div className={"value"}>{formatNumber(result.varainSiirtoVero)} € (1.6 %)</div></div>
                <div className={"row"}><div className={"label"}>Yhteensä</div><div className={"value"}>{formatNumber(result.kauppaSummaBrutto + result.varainSiirtoVero)} €</div></div>


            </article>

            <p>Lähde: <a href={"https://www.vero.fi/syventavat-vero-ohjeet/ohje-hakusivu/48262/arvopaperien-luovutusten-verotus3/"}>Vero.fi</a></p>

            <footer>
                &copy; 2022 <a href={"https://heusalagroup.fi"}>Heusala Group Oy</a>
                &nbsp;| <a href={"https://github.com/hangovergames/laskurit"}>Github</a>
                &nbsp;| <a href={"https://github.com/hangovergames/laskurit/issues"}>Issues</a>
            </footer>

        </div>
    );

}

export default OsakeKauppaLaskuriView;
