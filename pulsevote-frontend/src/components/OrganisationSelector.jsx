export default function OrganisationSelector({
  organisations,
  selectedId,
  onChange
}) {
  if (!organisations.length) return null;

  return (
    <label>
      Organisation

      <select
        value={selectedId}
        onChange={(event) => onChange(event.target.value)}
      >
        {organisations.map((organisation) => (
          <option
            key={organisation._id}
            value={organisation._id}
          >
            {organisation.name}
          </option>
        ))}
      </select>
    </label>
  );
}