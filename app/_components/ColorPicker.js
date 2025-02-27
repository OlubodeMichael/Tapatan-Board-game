const ColorPicker = ({ selectedColor, onColorChange, disabledColors }) => {
  const colors = [
    { name: 'Red', value: '#EF4444' },
    { name: 'Blue', value: '#3B82F6' },
    { name: 'Green', value: '#10B981' },
    { name: 'Purple', value: '#8B5CF6' },
    { name: 'Yellow', value: '#F59E0B' },
    { name: 'Pink', value: '#EC4899' },
    { name: 'Orange', value: '#F97316' },
    { name: 'Teal', value: '#14B8A6' }
  ];

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {colors.map((color) => (
        <button
          key={color.value}
          className={`w-8 h-8 rounded-full transition-all duration-200
            ${selectedColor === color.value ? 'ring-2 ring-white scale-110' : 'hover:scale-105'}
            ${disabledColors.includes(color.value) ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
          style={{ backgroundColor: color.value }}
          onClick={() => !disabledColors.includes(color.value) && onColorChange(color.value)}
          disabled={disabledColors.includes(color.value)}
          title={color.name}
        />
      ))}
    </div>
  );
};

export default ColorPicker; 