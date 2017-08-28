import Module from 'Parser/Core/Module';

class Pets extends Module {
  _sourceId = null;
  _pets = {}

  on_initialized() {
    this.active = true;
    this._pets = this.owner.report.friendlyPets.filter(pet => pet.petOwner === this.owner.player.id);

    if(this._pet !== undefined){
      const pet = this.fetchPet(this._pet);
      if(pet) this._sourceId = pet.id;
    }
  }

  on_damage(event){
    if(this._sourceId !== undefined && event.sourceID === this._sourceId){
      this._damageDone += event.amount;
    }
  }

  get fetchPets(){
    return this._pets;
  }

  get damageDone(){
    return this._damageDone;
  }

  fetchPet(pet){
    return this.fetchPets.find(_pet => _pet.guid === pet.id);
  }

}

export default Pets;