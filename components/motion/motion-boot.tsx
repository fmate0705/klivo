/**
 * A mozgásrendszer indítója.
 *
 * Egyetlen, a `<head>`-be ágyazott szkript, amely **az első festés előtt** fut
 * le, és két jelzőt tesz ki a `<html>` elemre:
 *
 * - `data-motion="ready"` — innen tudja a CSS, hogy a görgetésre megjelenő
 *   tartalmat el kell rejtenie. Enélkül minden látszik, tehát kikapcsolt
 *   JavaScript vagy egy hibás betöltés esetén sem tűnhet el a szöveg.
 * - `data-intro="run"` — a nyitó függönyt csak a munkamenet első oldalletöltése
 *   kapja meg. Aki visszalép egy aloldalról, annak nem játszunk le újra egy
 *   animációt, amit már látott.
 *
 * Miért beágyazott szkript és nem `useEffect`: az effekt a festés *után* fut.
 * Onnan indítva a látogató először látná a kész oldalt, aztán tűnne el belőle
 * minden, hogy újra megjelenhessen — pontosan az a villanás, amit el akarunk
 * kerülni. Ez az egyik olyan eset, ahol a beágyazott szkript a helyes válasz,
 * nem egy kerülőút.
 *
 * Csökkentett mozgás esetén egyik jelző sem kerül ki: nincs függöny, és nincs
 * mit felfedni.
 */

const BOOT = `try{
if(!matchMedia('(prefers-reduced-motion: reduce)').matches){
var d=document.documentElement;d.dataset.motion='ready';
if(!sessionStorage.getItem('klivo:intro')){d.dataset.intro='run';sessionStorage.setItem('klivo:intro','1');}
}}catch(e){}`;

export function MotionBoot() {
  return <script dangerouslySetInnerHTML={{ __html: BOOT }} />;
}
