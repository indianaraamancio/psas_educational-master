import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ServicesService } from 'src/app/services.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { AuthService } from 'angularx-social-login';
import { CookieService } from 'ngx-cookie-service';
declare var $: any;
declare var M: any;

@Component({
  selector: 'app-assessment-scale',
  templateUrl: './assessment-scale.component.html',
  styleUrls: ['./assessment-scale.component.css']
})
export class AssessmentScalesComponent implements OnInit {
  
  assessment = {
    _id: '',
    _rev: '',
    name: '',
    organizationId: '',
    userCreator: '',
    public: false,
    tool: '',
    status: 'active',
    questions: [],
  };

  organization = {
    _id: '',
    _rev: '',
    name: '',
    users: [],
    competences: [],
    status: ''
  };

  q = {
    name: '',
    description: '',
    competenceName: '',
    significance: 0
  };

  alternative = {
    description: '',
    option: '',
    percentage: 0
  };

  organizationId = '';
  organizationName = '';
  userProfile = '';
  userEmail = '';

  alternatives: {description: string}[]

  tools = [
    { value: 'rubric', description: 'Rubrica' }
  ];

  publicOptions = [
    { value: true, description: 'Sim' },
    { value: false, description: 'Não' }
  ];

  constructor(
    private route: ActivatedRoute,
    private service: ServicesService,
    private spinner: NgxSpinnerService,
    private authService: AuthService,
    private cookie: CookieService,
    private router: Router) { 
    }

  ngOnInit() {
    this.spinner.show();
    this.organizationId = this.cookie.get('ORGANIZATIONID');
    this.organizationName = this.cookie.get('ORGANIZATIONNAME');
    this.userProfile = this.cookie.get('ORGANIZATIONMEMBERPROFILE');
    this.alternatives = []
    this.authService.authState.subscribe((user) => {
      this.userEmail = user.email;
      this.route.paramMap.subscribe(params => {
        this.assessment._id = params.get('assessmentId');
        const alternatives = new Set()
        
        this.getAssessment();
      });
    });
  }

  initializeComponents() {
    setTimeout(this.initializeComponents, 200);
    $('select').formSelect();
    $('.collapsible').collapsible();
  }

  getAssessment() {
    this.service.findAssessmentById(this.assessment._id).subscribe((data) => {
      const a = Object(data).assessment;
      this.assessment._rev = a._rev;
      this.assessment.name = a.name;
      this.assessment.organizationId = a.organizationId;
      this.assessment.userCreator = a.userCreator;
      this.assessment.public = a.public;
      this.assessment.tool = a.tool;
      this.assessment.status = a.status;
      this.assessment.questions = a.questions;
      this.alternatives = a.questions[0].items;
      console.log(this.alternatives)
      this.service.findOrganizationById(this.assessment.organizationId).subscribe((org) => {
        const result = Object(org);
        this.organization._id = result._id;
        this.organization._rev = result._rev;
        this.organization.name = result.name;
        this.organization.competences = result.competences;
        this.organization.users = result.users;
        this.organization.status = result.status;
        this.spinner.hide();
        $('select').formSelect();
        this.initializeComponents();
      }, (error) => {
        this.router.navigate(['home']);
      });
      $('select').formSelect();
      $('.collapsible').collapsible();
    }, (error) => {
      this.router.navigate(['home']);
    });
  }

  filterTool(tool: string) {
    try  {
      return this.tools.find(t => t.value === tool).description;
    } catch {
      return tool;
    }
  }

  collapsible() {
    $('.collapsible').collapsible();
    M.updateTextFields();
  }

  changeDescription(item: number) {
    const field = '#itemDescription' + item;
    this.alternatives[item].description = $(field).val();
    console.log(field);
  }

  deleteAlternative(item: number) {
    this.alternatives.splice(item, 1);
  }

  addAlternative(question: number) {
    const newAlternative = {
      order: 0,
      description: '',
      option: '',
      percentage: ''
    };
    (this.alternatives as any).push(newAlternative);
  }
  save() {
    // alert("Escala salva");
    this.spinner.show();
    const alternatives = this.alternatives.map((alternative, index) => ({
      ...alternative,
      order: index,
      percentage: `${index + 1}`
    }) )
    this.assessment.questions.forEach(question => {
      question.items = alternatives;
    })
    console.log(this.assessment.questions)
    this.service.updateAssessment(this.assessment).subscribe((data) => {
      this.getAssessment();
    }, (error) => {
      this.router.navigate(['home']);
    });
  }
}
