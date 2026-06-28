import { Coins, MagnifyingGlass, Lightning, Lifebuoy } from "@phosphor-icons/react/dist/ssr";

const items = [
  { Icon: Coins, strong: "100 000 Ft-tól", rest: " átlátható árazás" },
  { Icon: MagnifyingGlass, strong: "SEO és AI SEO", rest: " beépítve" },
  { Icon: Lightning, strong: "Gyors", rest: " betöltés és átadás" },
  { Icon: Lifebuoy, strong: "Tárhely", rest: " és támogatás" },
];

export default function Trust() {
  return (
    <section className="trust" aria-label="Főbb előnyök">
      <div className="container trust__inner reveal">
        {items.map(({ Icon, strong, rest }) => (
          <span className="trust__item" key={strong}>
            <span className="icon-chip">
              <Icon size={18} />
            </span>
            <span>
              <strong>{strong}</strong>
              {rest}
            </span>
          </span>
        ))}
      </div>
    </section>
  );
}
