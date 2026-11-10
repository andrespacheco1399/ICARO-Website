/** Brand spelling of ICARO with the bar-less "Λ" (see .ic-lambda in index.css). Text content stays "ICARO". */
export const IcaroText = ({ mono = false, oClass }) => (
  <>
    IC<span className={mono ? "ic-lambda ic-lambda-mono" : "ic-lambda"}>A</span>R{oClass ? <span className={oClass}>O</span> : "O"}
  </>
);
