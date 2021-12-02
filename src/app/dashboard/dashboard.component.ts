import { Component, OnInit } from '@angular/core';
import * as Highcharts from 'highcharts';
import { HttpClient } from '@angular/common/http';
import { interval, Subscription } from 'rxjs';
import { ServicesService } from '../services.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { AuthService } from 'angularx-social-login';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material';
//import { runInThisContext } from 'vm';
declare var $: any;
declare var M: any;

declare var require: any;
// let Boost = require('highcharts/modules/boost');
// let noData = require('highcharts/modules/no-data-to-display');
let More = require('highcharts/highcharts-more');

// Boost(Highcharts);
// noData(Highcharts);
More(Highcharts);

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  constructor(
    private service: ServicesService,
    private spinner: NgxSpinnerService,
    private authService: AuthService,
    private cookie: CookieService,
    private http: HttpClient,
    private router: Router) { }

  organizationId = '';
  i=0;
  coefficientValue=0;
  organizationName = '';
  userProfile = '';
  userEmail = '';
  userName = '';
  spotlightCompetences = [];
  historySelectedCompetences = [];
  teams = [];
  members = [];
  people = [];
  peopleList = [];
  answers = [];
  projects = [];
  applications = [];
  assessments = [];
  topThreeCompetences = [];
  resultsChart = {
    categories: [],
    series: []    
  };

  selfGrades = [] /**Notas de cada questão */
  teacherGrades = []  /**Notas de cada questão */
  highestValueScale = 0; /**Valor mais alto da escala */


  selectedTeamId = ''
  selectedApplicationId = ''
  selectedProjectId = ''
  selectedMember = ''

  tableData: MatTableDataSource<any> = undefined;

  ngOnInit() {    
   
    this.spinner.show();
    this.organizationId = this.cookie.get('ORGANIZATIONID');
    this.organizationName = this.cookie.get('ORGANIZATIONNAME');
    this.userProfile = this.cookie.get('ORGANIZATIONMEMBERPROFILE');
    this.authService.authState.subscribe((user) => {
      if (user) {
        this.userEmail = user.email;
        this.userName = user.name;
        this.findProfile();
      } else {
        this.router.navigate(['home']);
      }
    });
    M.AutoInit();
    $('.indicator').addClass('light-blue');
    $('select').formSelect();
  }

  initializeComponents() {
    setTimeout(this.initializeComponents, 200);
    $('select').formSelect();
  }

  updateTeams() {
    this.teams = [];
    this.members = [];
    const tempIds = [];
    this.applications.forEach(app => {
      if (!tempIds.includes(app.team._id)) {
        tempIds.push(app.team._id);
        this.teams.push({ name: app.team.name, _id: app.team._id, projectId: app.team.projectId });
        app.team.members.forEach(member => {
          if(member.profile === 'organizationMember' && !this.members.some(el => el.email === member.email)) {
            this.members.push(member)
          }
        })
      }
    });
  }

  updateProjects(projects: any[]) {
    this.projects = [];
    const tempIds = [];
    this.teams.forEach(team => {
      if (!tempIds.includes(team.projectId)) {
        tempIds.push(team.projectId);
        projects.forEach((proj: { _id: any; name: any; }) => {
          if (proj._id === team.projectId) {
            this.projects.push({ name: proj.name, _id: proj._id });
          }
        });
      }
    });
  }

  findName(email: any) {
    let name = email;
    this.applications.forEach(a => {
      a.team.members.forEach((m: { email: any; name: any; }) => {
        if (m.email === email) {
          name = m.name || email;
        }
      });
    });
    if (name === this.userEmail) {
      name = this.userName;
    }
    return name;
  }

  updatePeople() {
    const emails = []
    this.people = this.answers.filter(answer => {
      const emailExists = emails.includes(answer.userRated)
      if(!emailExists) {
        emails.push(answer.userRated)
      }
      return !emailExists
    })
    this.peopleList = this.people
  }
  
  insertHighestValue(){
    let highest = -Infinity;
    //console.log("oi "+ value);    
    
    for(let i=0; i<this.applications.length; i++){  
      let valoresEscala = this.applications[i].name;
      
      if(valoresEscala===this.selectedApplicationId){
       for(let j=0; j<this.applications[i].assessment.questions[0].items.length; j++){
         let value = this.applications[i].assessment.questions[0].items[j].percentage;
         if(value>highest){
            highest=value;
         }
       
      }
      console.log("Maior valor da escala "+highest);
      this.highestValueScale=highest;      
      } 
    }
  }

  findProfile() {
    this.service.findOrganizationProfile(this.organizationId).subscribe((data) => {
      this.spotlightCompetences = [];

      this.answers = Object(data).answers;
      console.log(Object(data).answers);

      this.applications = Object(data).applications;
      console.log(Object(data).applications);

      this.updateTeams();      
      let compTempArray = [];
      this.answers.forEach(answer => {
        compTempArray.push(answer.questionCompetence);
        if (!this.spotlightCompetences.includes(answer.questionCompetence)) {
          this.spotlightCompetences.push(answer.questionCompetence);
        }
      });
      // this.selectTopThreeCompetences(Object(data));
    
      this.service.findProjectsFromUser().subscribe((proj) => {
        // this.updateTeamsList(Object(data).applications, Object(proj).projects);
        this.updateProjects(Object(proj).projects);
        this.updatePeople();
        this.initializeComponents();
        this.resultChartComparative();
        this.spinner.hide();
      }, (error) => {
        this.router.navigate(['home']);
      });
    }, (error) => {
      this.router.navigate(['home']);
    });
  }

  filterHistoryTeam(project: any, team: string, person: any, competence: any) {
    this.peopleList = [];
    if (team === '') {
      this.peopleList = this.people;
    } else {
      const tempEmail = [];
      this.answers.forEach(a => {
        if (a.teamId === team) {
          if (!tempEmail.includes(a.userRated)) {
            tempEmail.push(a.userRated);
            this.peopleList.push({ name: this.findName(a.userRated), email: a.userRated });
          }
        }
      });
    }
    this.initializeComponents();
  }

  resultChartComparative() {
    const teams = this.getTeams()
    const competencesSum: {
      teamId: string;
      isTeacher: boolean;
      name: string;
      competences: {
        competence: string;
        mean: number;
      }[]
    }[] = []

    teams.forEach(teamId => {
      const applicationsAnswers = this.getAnsersFromApplications(teamId)
      const competences = this.spotlightCompetences.map((competence: any) => {
        const {totalTeacher, ammountTeacher, totalTeam, ammountTeam} = applicationsAnswers.reduce((acc, cur) => {
          if(this.selectedMember !== '' && cur.userRated !== this.selectedMember) {
            return acc;
          }
          const isTeacher = cur.userEvaluator !== cur.userRated
          const isSelectedProject = this.selectedProjectId !== '' 
            ? (this.selectedProjectId === cur.projectId ? true: false) 
            : true

          if(isSelectedProject && cur.teamId === teamId && cur.questionCompetence === competence && cur.answer !== '') {
            if(isTeacher) {
              return {
                ...acc,
                totalTeacher: acc.totalTeacher + parseInt(cur.answer, 10),
                ammountTeacher: acc.ammountTeacher + 1,
              }  
            }
            return {
              ...acc,
              totalTeam: acc.totalTeam + parseInt(cur.answer, 10),
              ammountTeam: acc.ammountTeam + 1,
            }
          }
          return acc;
        }, {totalTeacher: 0, ammountTeacher: 0, totalTeam: 0, ammountTeam: 0})
        
        return {
          teacher: {competence, mean: totalTeacher / ammountTeacher },
          team: {competence, mean: totalTeam / ammountTeam },
        }
      })
      const teamName = this.findTeamName(teamId)

      const teacherCompetences = []
      const teamCompetences = []
      competences.forEach(({teacher, team}) => {
        teacherCompetences.push(teacher)
        teamCompetences.push(team)
      })

      competencesSum.push({
        teamId,
        isTeacher: true,
        name: `${teamName} - Professor`,
        competences: teacherCompetences
      })
      const member = this.selectedMember !== '' ? this.members.find(member => member.email === this.selectedMember) : undefined
      competencesSum.push({
        teamId,
        isTeacher: false,
        name: `${teamName} - ${member ? member.name : 'Alunos'}`,
        competences: teamCompetences
      })
    })

    const chartValues = competencesSum.map(({name, competences}) => {
      const data = competences.map(({mean}) => mean)
      return {
        name,
        data,
        pointPlacement: 'on',
      }
    })


    this.resultsChart = {
      categories: this.spotlightCompetences,
      series: chartValues,
    } 

    this.updateResultsChart()
    this.buildTable()
    //this.prepareIndexData()
  }

  getTeams() {
    if(this.selectedTeamId) {
      return [this.selectedTeamId]
    }
    const uniqueTeams = new Set<string>()
    this.answers.forEach(answer => {
      uniqueTeams.add(answer.teamId)
    })
    return Array.from(uniqueTeams)
  }

  getAnsersFromApplications(teamId: string) {
    const applications = this.applications.filter(application => application.team._id === teamId)
    const applicationsByApplication = this.selectedApplicationId ? applications.filter(application => application.name === this.selectedApplicationId) : applications

    const applicationsByProject = this.selectedProjectId ? applicationsByApplication.filter(application => application.team.projectId === this.selectedProjectId) : applicationsByApplication

    const answers = []
    applicationsByProject.forEach(application => {
      application.answers.forEach(answer => {
        answers.push(answer)
      })
    })
    return answers
  }

  calculateCoefficient(){
    



  }

  chartDataUpdated(
    field: 'selectedTeamId' | 'selectedApplicationId' | 'selectedProjectId' | 'selectedMember',
    value: string
  ) {
    this[`${field}`] = value;
    this.resultChartComparative();

    console.log("Valor recebido na chartUp. "+value);
    if(field==='selectedApplicationId'){
      this.insertHighestValue();
    }
    if(field==='selectedMember'){
      this.calculateCoefficient();       
    }    
      this.prepareIndexData(); 

  }
  

  findTeamName(teamId: string) {
    const app = this.applications.find(application => application.team._id === teamId)
    return app ? app.team.name : ''
  }

  findApplicationName(teamId: string) {
    const app = this.applications.find(application => application.team._id === teamId)
    return app ? app.name : ''
  }

  findProjectName(projectId: string) {
    const project = this.projects.find(project => project._id === projectId)
    return project ? project.name : ''
  }

  updateResultsChart() {
    Highcharts.chart('results', {
      chart: {
          polar: true,
          type: 'area',
          height: '450px',
      },
      title: {
          text: 'Autoavaliação x Avaliação do Professor',
          x: -80
      },
      pane: {
          size: '80%'
      },
      xAxis: {
          categories: this.resultsChart.categories,
          tickmarkPlacement: 'on',
          lineWidth: 0
      },
      yAxis: {
          gridLineInterpolation: 'polygon',
          lineWidth: 0,
          min: 0
      },
      tooltip: {
          shared: true,
          pointFormat: '<span style="color:{series.color}">{series.name}: {point.y:,.0f}%<br/>'
      },
      legend: {
          align: 'right',
          verticalAlign: 'middle',
          layout: 'vertical'
      },
      series: this.resultsChart.series,
      responsive: {
          rules: [{
              condition: {
                  maxWidth: 500
              },
              chartOptions: {
                  legend: {
                      align: 'center',
                      verticalAlign: 'bottom',
                      layout: 'horizontal'
                  },
                  pane: {
                      size: '70%'
                  }
              }
          }]
      }
    });
    $('.highcharts-credits').hide();
  }

  buildTable() {
    const data = {}
    this.answers.forEach(answer => {
      const isTeacher = answer.userEvaluator !== answer.userRated
      const teamName = this.findTeamName(answer.teamId)
      const projectName = this.findProjectName(answer.projectId)
      const applicationName = this.findApplicationName(answer.teamId)
      console.log(teamName, projectName, applicationName)
      const key = `${teamName}:${projectName}:${applicationName}:${answer.questionCompetence}`
      if(!(key in data)) {
        data[key] = {
          teamName,
          projectName,
          applicationName,
          criteria: answer.questionCompetence
        }
      }
      const field = isTeacher ? 'teacher' : 'student'
      data[key] = {
        ...data[key],
        [`${field}`]: answer.answer
      }
    })

    this.tableData = new MatTableDataSource(Object.values(data))
  }
/*
  prepareIndexData() {
    console.log("Entrei na prepareIndexData");
   
    let highestValue = -Infinity;
    this.selfGrades=[];
    this.teacherGrades=[];
    this.answers.forEach(answer => {
      const isTeacher = answer.userEvaluator !== answer.userRated
      if(isTeacher) {
        this.teacherGrades.push(answer.answer)
      } else {
        this.selfGrades.push(answer.answer)
      }
     // highestValue = highestValue < answer.answer ? answer.answer : highestValue
    })

   // this.highestValueScale = highestValue;
   for(let i=0; i<this.selfGrades.length; i++){
    console.log("Valor da autoavaliação "+this.selfGrades[i]);
    console.log("Valor da avaliação do prof "+this.teacherGrades[i]);
  }
    console.log("Maior valor da escala "+this.highestValueScale);    
  }
  */

  prepareIndexData() {
    console.log("Entrei na prepareIndexData");
    if(this.selectedApplicationId && this.selectedMember && this.selectedProjectId && this.selectedTeamId){
      const appByTeam = this.applications.filter(application => application.team._id === this.selectedTeamId)
      const appByApplication = this.selectedApplicationId ? appByTeam.filter(application => application.name === this.selectedApplicationId) : appByTeam

      const appByProject = this.selectedProjectId ? appByApplication.filter(application => application.team.projectId === this.selectedProjectId) : appByApplication
      this.teacherGrades = []
      this.selfGrades = []
      appByProject.forEach(application => {
        application.answers.forEach(answer => {
          const isStudent = this.selectedMember === answer.userRated
          if (isStudent){
            const isTeacher = answer.userEvaluator !== answer.userRated
            if(isTeacher) {
              this.teacherGrades.push(answer.answer)
            } else {
              this.selfGrades.push(answer.answer)
            }
          }

        })
      })
      console.log("dados prof: " + this.teacherGrades);
      console.log("dados aluno: " + this.selfGrades);
      this.insertHighestValue();
    }else{
      console.log("falta selecionar algo: "+this.selectedApplicationId + this.selectedMember + this.selectedProjectId + this.selectedTeamId)
    }

  }
}