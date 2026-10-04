// Pack-Assist AI Client Script

document.addEventListener('DOMContentLoaded', () => {
  // 1. Sync Range Sliders with Output Displays
  const rangeInputs = document.querySelectorAll('input[type="range"][data-display]');
  rangeInputs.forEach((range) => {
    const displayId = range.getAttribute('data-display');
    const displayElem = document.getElementById(displayId);
    if (displayElem) {
      const updateValue = () => {
        const unit = range.getAttribute('data-unit') || '';
        displayElem.textContent = `${range.value}${unit}`;
      };
      range.addEventListener('input', updateValue);
      updateValue();
    }
  });

  // 2. Preset Commodity Profiles for 1-Click Form Filling
  const presets = {
    strawberries: {
      name: 'Fresh Hydroponic Strawberries',
      type: 'Fresh Produce',
      moisture: 91.0,
      fat: 0.4,
      ph: 3.5,
      respiration: 'High',
      shelfLife: 14,
      temp: 3.0,
      humidity: 90.0,
      storage: 'Refrigerated (2-6°C)',
      transport: 'Cold Chain Refrigerated',
      packagingType: 'Micro-Perforated Breathable Bag',
      packagingSize: 'Small Retail Pack (100g - 250g)',
      mapRequired: 'Yes'
    },
    potatoChips: {
      name: 'Artisan Kettle Potato Chips',
      type: 'Bakery & Snacks',
      moisture: 2.1,
      fat: 32.5,
      ph: 6.2,
      respiration: 'None',
      shelfLife: 180,
      temp: 22.0,
      humidity: 45.0,
      storage: 'Ambient',
      transport: 'Standard Ambient',
      packagingType: 'Pillow Pouch / Form-Fill-Seal (FFS)',
      packagingSize: 'Snack / Single-Serve (< 100g)',
      mapRequired: 'Yes'
    },
    beefSteak: {
      name: 'Fresh Prime Beef Ribeye Steak',
      type: 'Fresh Meat & Poultry',
      moisture: 72.0,
      fat: 18.0,
      ph: 5.6,
      respiration: 'None',
      shelfLife: 21,
      temp: 1.5,
      humidity: 85.0,
      storage: 'Refrigerated (2-6°C)',
      transport: 'Cold Chain Refrigerated',
      packagingType: 'Thermoformed Tray & Lidding Film',
      packagingSize: 'Retail Standard (250g - 500g)',
      mapRequired: 'Yes'
    },
    cheddarCheese: {
      name: 'Aged Cheddar Cheese Block',
      type: 'Dairy & Cheese',
      moisture: 36.5,
      fat: 33.0,
      ph: 5.2,
      respiration: 'None',
      shelfLife: 120,
      temp: 4.0,
      humidity: 75.0,
      storage: 'Refrigerated (2-6°C)',
      transport: 'Cold Chain Refrigerated',
      packagingType: 'Vacuum Skin Packaging (VSP)',
      packagingSize: 'Retail Standard (250g - 500g)',
      mapRequired: 'Yes'
    },
    roastedCoffee: {
      name: 'Single-Origin Roasted Coffee Beans',
      type: 'Coffee & Spices',
      moisture: 2.5,
      fat: 15.0,
      ph: 5.0,
      respiration: 'None',
      shelfLife: 365,
      temp: 20.0,
      humidity: 40.0,
      storage: 'Ambient',
      transport: 'Export / High Vibration',
      packagingType: 'Gusseted Foil Bag with Degassing Valve',
      packagingSize: 'Retail Standard (250g - 500g)',
      mapRequired: 'No'
    },
    frozenBerries: {
      name: 'Organic IQF Frozen Blueberries',
      type: 'Frozen Foods',
      moisture: 84.0,
      fat: 0.3,
      ph: 3.8,
      respiration: 'None',
      shelfLife: 365,
      temp: -20.0,
      humidity: 70.0,
      storage: 'Frozen (-18°C)',
      transport: 'Deep Freeze Logistics',
      packagingType: 'Stand-Up Pouch (Doypack)',
      packagingSize: 'Family Pack (750g - 1.5kg)',
      mapRequired: 'No'
    }
  };

  const presetButtons = document.querySelectorAll('[data-preset]');
  presetButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const presetKey = btn.getAttribute('data-preset');
      const data = presets[presetKey];
      if (!data) return;

      const setVal = (id, val) => {
        const el = document.getElementById(id);
        if (el) {
          el.value = val;
          el.dispatchEvent(new Event('input'));
          el.dispatchEvent(new Event('change'));
        }
      };

      setVal('commodity_name', data.name);
      setVal('commodity_type', data.type);
      setVal('moisture_content', data.moisture);
      setVal('fat_content', data.fat);
      setVal('ph', data.ph);
      setVal('respiration_rate', data.respiration);
      setVal('shelf_life_days', data.shelfLife);
      setVal('storage_temp', data.temp);
      setVal('humidity_val_input', data.humidity);
      setVal('storage_type', data.storage);
      setVal('transport_conditions', data.transport);
      setVal('packaging_type', data.packagingType);
      setVal('packaging_size', data.packagingSize);
      setVal('map_required', data.mapRequired);

      // Highlight button briefly
      presetButtons.forEach(b => b.classList.remove('ring-2', 'ring-sky-500', 'bg-sky-50'));
      btn.classList.add('ring-2', 'ring-sky-500', 'bg-sky-50');
    });
  });

  // 3. Copy to clipboard button
  const copyBtn = document.getElementById('copySpecsBtn');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const text = copyBtn.getAttribute('data-specs');
      if (text) {
        navigator.clipboard.writeText(text).then(() => {
          const original = copyBtn.innerHTML;
          copyBtn.innerHTML = '<i class="bi bi-check2 text-emerald-600 me-1"></i> Copied!';
          setTimeout(() => {
            copyBtn.innerHTML = original;
          }, 2000);
        });
      }
    });
  }

  // 4. Fill Demo Credentials
  const fillDemoBtn = document.getElementById('fillDemoCredentials');
  if (fillDemoBtn) {
    fillDemoBtn.addEventListener('click', () => {
      const emailField = document.getElementById('email');
      const passField = document.getElementById('password');
      if (emailField && passField) {
        emailField.value = 'scientist@packassist.ai';
        passField.value = 'PackAssist2026!';
      }
    });
  }
});
