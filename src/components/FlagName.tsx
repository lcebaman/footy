interface FlagNameProps {
  name: string;
}

const codeMap: Record<string, string> = {
  Argentina: "ar", Brazil: "br", France: "fr", Germany: "de", England: "gb-eng",
  Spain: "es", Portugal: "pt", Netherlands: "nl", Italy: "it", Uruguay: "uy",
  USA: "us", Mexico: "mx", Japan: "jp", "South Korea": "kr", Nigeria: "ng",
  Morocco: "ma", Croatia: "hr", Denmark: "dk", Sweden: "se", Norway: "no",
  Switzerland: "ch", Poland: "pl", Australia: "au", Colombia: "co",
  Chile: "cl", Ecuador: "ec", Canada: "ca", Iran: "ir", Cameroon: "cm",
  Ghana: "gh", Senegal: "sn", Ukraine: "ua",
};

export function FlagName({ name }: FlagNameProps) {
  const code = codeMap[name];
  return (
    <span className="inline-flex items-center gap-2">
      {code && (
        <img
          src={`https://flagcdn.com/24x18/${code}.png`}
          alt={name}
          className="inline-block w-6 h-5 rounded-sm border"
        />
      )}
      <span>{name}</span>
    </span>
  );
}
