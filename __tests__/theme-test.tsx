import fs from 'fs';
import defaultColors from '../helpers/theme-colors.json';

/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
describe('theme', () => {
  describe('color definitions', () => {
    it('should be the same for all customers and default theme', () => {
      const defaultColorsKeys = Object.keys(defaultColors.light).sort();
      const checkColorDefinitions = (colorDefinitions: object) => {
        expect(colorDefinitions).toBeDefined();

        expect(Object.keys(colorDefinitions).sort()).toEqual(defaultColorsKeys);
      };

      checkColorDefinitions(defaultColors.dark);

      const customersFolder = `${__dirname}/../customers`;

      const customerFolders = fs
        .readdirSync(customersFolder)
        .filter(file => fs.statSync(`${customersFolder}/${file}`)?.isDirectory());

      customerFolders.forEach(folder => {
        const customerColors = require(`../customers/${folder}/theme-colors.json`);
        checkColorDefinitions(customerColors.light);
        checkColorDefinitions(customerColors.dark);
      });
    });
  });
});
