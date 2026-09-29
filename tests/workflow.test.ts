import {it,expect} from 'vitest';
import {selectDraft} from '../src/domain/evidence';
import {initialState,generated,approve,edit,exportText} from '../src/domain/workflow';
const drafted=()=>generated(initialState,selectDraft(initialState.input));
it('blocks direct export before review',()=>{expect(()=>exportText(initialState)).toThrow();expect(()=>exportText(drafted())).toThrow();});
it('exports only a reviewed current version',()=>{const s=approve(drafted());expect(exportText(s)).toContain('DEMO - DATOS FICTICIOS');expect(()=>exportText({...s,version:s.version+1})).toThrow();expect(()=>exportText({...s,input:{...s.input,wording:'formal'}})).toThrow();});
it('invalidates edits and regeneration',()=>{const s=approve(drafted());expect(edit(s,{...s.input,withheld:['A_LOGIN']}).approval).toBeNull();expect(generated(s,selectDraft(s.input)).approval).toBeNull();expect(()=>exportText(edit(s,s.input))).toThrow();});
