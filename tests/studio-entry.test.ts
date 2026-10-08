import {test} from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import Workspace from '../src/components/workspace';
import Landing from '../src/app/page';
test('starting drawing opens an unobstructed plan with free angles and exact fields',()=>{const html=renderToStaticMarkup(React.createElement<NonNullable<Parameters<typeof Workspace>[0]>>(Workspace,{startDrawing:true}));assert.match(html,/Plan ogrodzenia/);assert.match(html,/Długość rysowanego odcinka/);assert.match(html,/Kąt rysowania/);assert.match(html,/ORTO OFF/);assert.doesNotMatch(html,/Rozpocznij rysowanie/);assert.doesNotMatch(html,/empty-plan/);assert.doesNotMatch(html,/type="range"/);});
test('landing offers working destinations for drawing, gallery, shop and contact',()=>{const html=renderToStaticMarkup(React.createElement(Landing));for(const route of ['/konfigurator','/galeria','/sklep','/kontakt'])assert.ok(html.includes(`href="${route}"`));assert.match(html,/Zacznij rysowanie/);assert.match(html,/Co chcesz dziś zrobić/);});
