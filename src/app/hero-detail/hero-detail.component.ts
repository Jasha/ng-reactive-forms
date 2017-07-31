import { Component, Input, OnChanges } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Address, Hero, states } from '../data-model';
import { HeroService } from '../hero.service';

@Component({
  selector: 'app-hero-detail',
  templateUrl: './hero-detail.component.html',
  styleUrls: ['./hero-detail.component.scss']
})
export class HeroDetailComponent implements OnChanges {
  @Input() hero: Hero;
  heroForm: FormGroup;
  states = states;

  constructor(private formBuilder: FormBuilder, private heroService: HeroService) {
    this.createForm();
  }

  createForm() {
    this.heroForm = this.formBuilder.group({
      name: ['', Validators.required],
      // address: this.formBuilder.group(new Address()),
      secretLairs: this.formBuilder.array([]),
      power: '',
      sidekick: ''
    });
  }

  ngOnChanges() {
    this.heroForm.reset({
      name: this.hero.name,
      address: this.hero.addresses[0] || new Address()
    });
  }

  setAddresses(addresses: Address[]) {
    const addressFGs = addresses.map(address => this.formBuilder.group(address));
    const addressFormArray = this.formBuilder.array(addressFGs);
    this.heroForm.setControl('secretLairs', addressFormArray);
  }

  get secretLairs(): FormArray {
    return this.heroForm.get('secretLairs') as FormArray;
  }

  addLair() {
    this.secretLairs.push(this.formBuilder.group(new Address()));
  }

  removeLair(index: number) {
    this.secretLairs.removeAt(index);
  }

  onSubmit() {
    this.hero = this.prepareSaveHero();
    this.heroService.updateHero(this.hero).subscribe(/* error handling */);
    this.ngOnChanges();
  }

  prepareSaveHero(): Hero {
    const formModel = this.heroForm.value;

    // deep copy of form model lairs
    const secretLairsDeepCopy: Address[] = formModel.secretLairs.map(
      (address: Address) => Object.assign({}, address)
    );

    // return new `Hero` object containing a combination of original hero value(s)
    // and deep copies of changed form model values
    return {
      id: this.hero.id,
      name: formModel.name as string,
      // addresses: formModel.secretLairs // <-- bad!
      addresses: secretLairsDeepCopy
    };
  }

  revert() {
    this.ngOnChanges();
  }
}
